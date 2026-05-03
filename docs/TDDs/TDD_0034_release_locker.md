---
id: "0034"
estado: Propuesto
autor: Mariano
fecha: 2026-05-02
titulo: Liberar locker
---


# TDD-0034: Liberar locker


## Contexto de Negocio (PRD)


### Objetivo
Permitir que un casillero actualmente ocupado sea liberado, desvinculándolo del socio actual y dejándolo disponible para un nuevo alquiler.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo) o Recepcionista
*   **Necesidad**: Registrar en el sistema cuando un socio devuelve la llave y desocupa su casillero, para que vuelva a estar en el pool de casilleros disponibles.

### Criterios de Aceptación
*   CA 1 - El sistema debe validar que el Locker exista en la base de datos.
*   CA 2 - El sistema debe validar que el status actual del locker sea `Occupied`. Si el locker está `Available` o `Maintenance`, debe rechazar la operación con un error lógico.
*   CA 3 - Al liberarse, el `status` del locker debe pasar a `Available` y el campo `member_id` debe quedar forzado a nulo.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`. No se requieren modificaciones estructurales en `schema.prisma`, solo actualización de datos de un registro existente.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `PATCH /api/v1/lockers/:id/release`
*   **Request Body**: `None`
*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Available';
    memberId: null;
}
```


### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Método `updateRelease(id, expectedStatus)`.
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el estado del locker sea `Occupied` antes de liberarlo.
*   **Caso de uso**: `ReleaseLockerUseCase` Orquesta la obtención del locker, valida su estado y llama al repositorio para vaciar el `member_id` y actualizar el `status`.
*   **Adaptador de salida**: `PostgresLockerRepository` Actualización en base de datos usando el método `update` de Prisma forzando `member_id: null` y `status: 'Available'`.
*   **Adaptador de entrada**: `LockerController` Ruta HTTP PATCH, extrae el ID de la URL y mapea excepciones a códigos HTTP.


## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| El id del locker no existe en la BD     | El sistema devuelve error de recurso no encontrado       | 404 Not Found              |
| El locker tiene estado `Available` | El sistema devuelve error de conflicto indicando que ya está disponible   | 409 Conflict  |
| El locker tiene estado `Maintenance` | No se puede liberar un casillero en mantenimiento           | 400 Bad Request            |



## Plan de Implementación
1. Actualizar el puerto `LockerRepository` con el método para liberar el alquiler.
2. Crear el método de actualización en `PostgresLockerRepository` para limpiar la relación del socio y cambiar el estado `prisma.locker.update({ where: { id }, data: { status: 'Available', member_id: null } })`.
3. Implementar `ReleaseLockerUseCase` para orquestar la liberación.
4. Crear el endpoint `PATCH /api/v1/lockers/:id/release` en el `LockerController`.
5. Agregar un botón de "Liberar" en la fila correspondiente a cada casillero ocupado dentro de la vista de listado de Lockers en el Frontend.
6. Agregar tests unitarios del caso de uso (verificando que rechace casilleros libres o en mantenimiento) y tests de integración del endpoint.

