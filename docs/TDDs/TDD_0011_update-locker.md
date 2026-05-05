---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Modificación de casillero
---

# TDD-0011: Modificación de casillero

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrador del club modifique los datos básicos de un casillero existente dentro del sistema Alentapp y gestione su asignación a un socio.

Esta funcionalidad permite corregir o actualizar la información de un casillero ya registrado, manteniendo la consistencia de los datos, evitando casilleros duplicados y controlando que la asignación de socios respete el estado actual del casillero.

### User Persona

*   **Nombre**: Administrador del club
*   **Necesidad**: Actualizar la información de un casillero existente, modificar su ubicación o estado, y asignarlo o desasignarlo de un socio cuando corresponda.

### Criterios de Aceptación

*   El sistema deberá permitir modificar un casillero existente.
*   El sistema deberá validar que el casillero exista antes de actualizarlo.
*   El sistema debera validar que el casillero no haya sido dado de baja, es decir  que 'deleted_at = null'
*   El sistema deberá permitir modificar los campos `number`, `location`, `status` y `member_id`.
*   El sistema deberá validar que el campo `number` sea obligatorio.
*   El sistema deberá validar que el campo `number` sea mayor a cero.
*   El sistema deberá validar que el campo `number` no pertenezca a otro casillero.
*   El sistema deberá validar que el campo `location` sea obligatorio.
*   El sistema deberá validar que el campo `location` pertenezca a una locación permitida.
*   El sistema deberá validar que el campo `status` tenga un valor permitido.
*   Si `status = assigned`, el sistema debera validar que `member_id` corresponda a un socio y que no sea null
*   Si `status = available` o `status = maintenance`, el sistema debera validar que `member_id = null`
*   El sistema deberá impedir que un casillero sea asignado a un socio si su `status` es `Maintenance`.
*   Al finalizar la modificación, el sistema deberá guardar los nuevos datos del casillero.
*   Si el casillero no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Locker` existente para actualizar los datos básicos de un casillero y gestionar su asignación a un socio.

*   `id`: UUID. Identificador único del casillero.
*   `number`: Int. Número identificatorio del casillero. Obligatorio, único y mayor a cero.
*   `location`: String. Ubicación física del casillero dentro del club. Debe pertenecer a una lista de locaciones permitidas.
*   `status`: String. Estado actual del casillero.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero.
*   `deleted_at`: Date | null. Fecha de baja lógica. No se modifica en esta operación.

Locaciones permitidas para `location`:

*   `Hall`
*   `Vestibulo`
*   `Pasillo`
*   `Gimnasio`
*   `Administracion`

Estados permitidos para `status`:

*   `Available`: casillero disponible.
*   `Assigned`: casillero asignado.
*   `Maintenance`: casillero en mantenimiento.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/lockers/:id`

*   **Request Body**:

```ts
{
    number: number;
    location: "Hall" | "Vestibulo" | "Pasillo" | "Gimnasio" | "Administracion";
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
}
```

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    location: "Hall" | "Vestibulo" | "Pasillo" | "Gimnasio" | "Administracion";
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
    deleted_at: string | null 
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: Entidad `Locker` y reglas de negocio para modificar casilleros: número único, ubicación válida, estado permitido y asignación coherente del socio según el estado del casillero.

*   **Application**: Caso de uso `UpdateLockerUseCase`, encargado de validar la existencia del casillero, verificar que no esté dado de baja, validar los datos recibidos y solicitar la actualización.

*   **Infrastructure**: Controlador HTTP para `PUT /api/v1/lockers/:id`, consulta de socio cuando se envía `member_id` y repositorio de casilleros implementado con Prisma.

## Casos de Borde y Errores

| Escenario                                        | Resultado Esperado                                                       | Código HTTP      |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ---------------- |
| El casillero no existe                           | Error indicando que el casillero no fue encontrado                        | 404 Not Found    |
| No se envía `number`                             | Error indicando que el número de casillero es requerido                   | 400 Bad Request  |
| `number` es menor o igual a cero                 | Error indicando que el número debe ser mayor a cero                       | 400 Bad Request  |
| No se envía `location`                           | Error indicando que la ubicación es requerida                             | 400 Bad Request  |
| `location` tiene un valor inválido               | Error indicando que la ubicación no es válida                             | 400 Bad Request  |
| Ya existe otro casillero con ese número          | Error indicando que el número de casillero ya está en uso                 | 409 Conflict     |
| `status` tiene un valor inválido                 | Error indicando que el estado del casillero no es válido                  | 400 Bad Request  |
| `status` es `Assigned` y no se envía `member_id` | Error indicando que debe indicarse un socio para asignar el casillero     | 400 Bad Request  |
| `member_id` no corresponde a un socio existente  | Error indicando que el socio no fue encontrado                            | 404 Not Found    |
| `status` es `Maintenance` y se envía `member_id` | Error indicando que no se puede asignar un casillero en mantenimiento     | 400 Bad Request  |
| `status` es `Available` y se envía `member_id`   | Error indicando que un casillero disponible no puede tener socio asignado | 400 Bad Request  |
| Error inesperado al guardar                      | Error interno del servidor                                                | 500 Server Error |

## Plan de Implementación


1. Definir el contrato compartido para modificar casilleros en `@alentapp/shared`.
2. Verificar que el modelo `Locker` exista en Prisma con los campos necesarios.
3. Implementar el caso de uso `UpdateLockerUseCase`.
4. Buscar el casillero por `id`.
5. Validar que el casillero exista.
6. Validar que `deleted_at = null`.
7. Validar que `number` sea obligatorio, mayor a cero y no pertenezca a otro casillero.
8. Validar que `location` sea obligatoria y pertenezca a una locación permitida.
9. Validar que `status` tenga un valor permitido.
10. Validar la relación entre `status` y `member_id`.
11. Validar que el socio exista cuando corresponda.
12. Actualizar los campos `number`, `location`, `status` y `member_id`.
13. Implementar el endpoint `PUT /api/v1/lockers/:id`.
14. Agregar pruebas para modificación exitosa y casos de error.
