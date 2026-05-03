---
id: "0033"
estado: Propuesto
autor: Mariano
fecha: 2026-05-02
titulo: Alquilar locker
---


# TDD-0033: Alquilar locker


## Contexto de Negocio (PRD)


### Objetivo
Permitir que un socio alquile un casillero específico, cambiando su estado a ocupado y vinculándolo a su cuenta.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo) o Recepcionista
*   **Necesidad**: Asignar un casillero vacío a un socio que acaba de solicitarlo, asegurando que no se lo den a otra persona por error.

### Criterios de Aceptación
*   CA 1 - El sistema debe validar que tanto el Locker como el Socio `member_id` existan en la base de datos.
*   CA 2 - El sistema debe validar que el status actual del locker sea `Available`. Si el locker está en `Maintenance` o ya se encuentra `Occupied`, debe rechazar la asignación.
*   CA 3 - Al asignarse, el `status` del locker debe pasar a `Occupied` y el campo `member_id` debe actualizarse con el ID del socio
*   CA 4 - El sistema debe manejar la concurrencia (Condiciones de carrera) para garantizar que si dos recepcionistas intentan asignar el mismo locker vacío al mismo tiempo, solo uno tenga éxito y el otro reciba un error.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker` y Entidad `Member` (Solo lectura para validación). No se requieren cambios en `schema.prisma`, solo actualizaciones sobre los registros existentes.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `PATCH /api/v1/lockers/:id/rent`
*   **Request Body (RentLockerRequest)**:
```ts
{
    memberId: string;
}
```
*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Occupied';
    memberId: string;
}
```


### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Método `updateRent(lockerId, memberId, expectedStatus)`, `MemberRepository` Método `findById(memberId)` para validar el socio.
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el estado del locker permita ser alquilado.
*   **Caso de uso**: `RentLockerUseCase` Orquesta la validación de existencia del socio y del locker, y llama al repositorio manejando el error de concurrencia.
*   **Adaptador de salida**: `PostgresLockerRepository` Actualización en base de datos usando el método `update` de Prisma con una cláusula `where` que exija que el estado actual sea `Available` para evitar condiciones de carrera.
*   **Adaptador de entrada**: `LockerController` Ruta HTTP PATCH, extrae el ID de la URL y el `memberId` del body, mapeando excepciones a códigos HTTP.


## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| El id del locker no existe en la BD     | El sistema devuelve error de recurso no encontrado       | 404 Not Found              |
| El `member_id` provisto no existe | El sistema devuelve error indicando que el socio no existe     | 404 Not Found              |
| El locker tiene estado `Maintenance` | No se puede asignar un casillero en mantenimiento           | 400 Bad Request            |
| El locker ya tiene estado `Occupied` | El sistema devuelve error de conflicto indicando que ya está alquilado   | 409 Conflict  |
| Condición de carrera (dos peticiones simultáneas sobre el mismo locker) | La base de datos actualiza la primera petición. La segunda falla al no cumplir el `where status = Available` y devuelve conflicto | 409 Conflict |

## Plan de Implementación
1. Definir `RentLockerRequest` en el paquete de tipos compartidos `@alentapp/shared`.
2. Actualizar el puerto `LockerRepository` con el método para actualizar el alquiler.
3. Crear el método transaccional / atómico en `PostgresLockerRepository` usando Prisma `prisma.locker.update({ where: { id, status: 'Available' }, data: { status: 'Occupied', member_id } })`.
4. Reutilizar el puerto `MemberRepository` para validar que el socio exista antes de proceder.
5. Implementar `RentLockerUseCase` orquestando las validaciones y el guardado.
6. Crear el endpoint `PATCH /api/v1/lockers/:id/rent` en el `LockerController`.
7. Conectar la acción de "Alquilar" en el listado de lockers del frontend.
8. Agregar test unitarios verificando la lógica de rechazo si está en mantenimiento, y tests de integración.