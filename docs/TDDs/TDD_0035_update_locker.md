---
id: "0035"
estado: Propuesto
autor: Mariano
fecha: 2026-05-04
titulo: Actualización de Locker
---
# TDD-[0035]: Actualización de Locker

## Contexto de Negocio (PRD)

### Objetivo
Permitir la modificación de los datos físicos o identificatorios de un casillero existente (como su número o ubicación) en caso de errores de carga o reubicación física en las instalaciones.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo).
*   **Necesidad**: Corregir información ingresada incorrectamente al dar de alta un locker o actualizar su ubicación física si es movido.

### Criterios de Aceptación
* CA 1 - El sistema debe validar que el Locker a editar exista en la base de datos.
* CA 2 - Si se modifica el número de casillero (`number`), el sistema debe validar que el nuevo número sea mayor a cero y que sea estrictamente único. Si el número ya pertenece a otro locker, debe rechazar la operación.
* CA 3 - Regla de Negocio: El estado (`status`) no puede ser modificado mediante esta operación. Si el cliente envía el campo `status` en la petición, el sistema debe rechazarla con un error para forzar el uso de los endpoints específicos de transición de estado.
* CA 4 - La modificación no debe afectar la relación con el socio (`member_id`).

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`. No se requieren modificaciones en `schema.prisma`. Se realizarán actualizaciones sobre un registro existente.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `PATCH /api/v1/lockers/:id`
*   **Request Body (UpdateLockerRequest)**:
```ts
{
    number?: number;
    location?: string;
}
```
*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Available' | 'Maintenance' | 'Occupied';
    memberId: string | null;
}
```

### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Métodos `findById(id)`, `existsByNumber(number)` y `update(id, data)`.
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el nuevo número sea mayor a cero y que no se intente inyectar el campo status.
*   **Caso de Uso**: `UpdateLockerUseCase` Orquesta la obtención del locker, la verificación de unicidad si el número cambia, y la actualización de los campos permitidos.
*   **Adaptador de Salida**: `PostgresLockerRepository` Actualización en base de datos usando el método update de Prisma.
*   **Adaptador de Entrada**: `LockerController` Ruta HTTP PATCH, extrae el ID de la URL y el payload, mapeando excepciones a códigos HTTP.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| El id del locker no existe en la BD     | El sistema devuelve error de recurso no encontrado       | 404 Not Found              |
| Se envia un `number` que ya existe en la BD | El número de locker ingresado ya se encuentra registrado | 409 Conflict  |
| Se envia un `number` menor o igual a 0, nulo, o de un tipo de dato incorrecto | El número de locker debe ser un valor entero mayor a cero | 400 Bad Request           |
| Se envia el campo `location` como un string vacio `""` | La ubicacion del locker no puede estar vacia | 400 Bad Request |
| Se envia el campo `status` en el payload | El sistema debe rechazar la operacion con un error           | 400 Bad Request            |



## Plan de Implementación
1. Definir `UpdateLockerRequest` en el paquete `@alentapp/shared`.
2. Actualizar el puerto `LockerRepository` agregando los métodos `findById` y `update`.
3. Implementar `UpdateLockerUseCase` asegurando que verifique la unicidad del número solo si este fue provisto y es distinto al actual.
4. Crear el endpoint `PATCH /api/v1/lockers/:id` en el `LockerController`.
5. Agregar la funcionalidad de edición en el Frontend mediante un modal o formulario conectado al endpoint.
6. Agregar tests unitarios del caso de uso (verificando el rechazo al intentar enviar el `status`) y tests de integración del endpoint.


