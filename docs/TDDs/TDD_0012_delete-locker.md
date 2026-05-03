---
autor: [Luana Suarez]
fecha: [2026-05-02]
titulo: [Baja del casillero]
---


---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Baja de casillero
---

# TDD-0012: Baja de casillero

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrador del club dé de baja un casillero existente dentro del sistema Alentapp.

Esta funcionalidad permite quitar un casillero del uso operativo del sistema sin eliminar físicamente su registro de la base de datos. De esta forma, se mantiene la información histórica y se evita perder datos que podrían ser necesarios para consultas futuras.

### User Persona

*   **Nombre**: Administrador del club
*   **Necesidad**: Dar de baja casilleros que ya no se utilizan, que fueron retirados del club o que no deben estar disponibles para nuevas operaciones.

### Criterios de Aceptación

*   El sistema deberá permitir dar de baja un casillero existente.
*   El sistema deberá validar que el casillero exista antes de darlo de baja.
*   El sistema no deberá eliminar físicamente el casillero de la base de datos.
*   Al finalizar la baja, el sistema deberá marcar el casillero como inactivo.
*   Un casillero dado de baja no deberá aparecer como disponible para futuras operaciones.
*   Si el casillero no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)
### Modelo de Datos

Se utilizará la entidad `Locker` existente para representar los casilleros del sistema.

Para la baja de un casillero no se realizará eliminación física del registro. En su lugar, se actualizará el campo `is_active` a `false`.

*   `id`: UUID. Identificador único del casillero.
*   `number`: Int. Número identificatorio del casillero.
*   `location`: String. Ubicación física o referencia del casillero dentro del club.
*   `status`: String. Estado actual del casillero.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero.
*   `is_active`: Boolean. Indica si el casillero se encuentra activo dentro del sistema.

Restricciones:

*   `id` debe corresponder a un casillero existente.
*   La baja no debe eliminar físicamente el registro.
*   Al dar de baja el casillero, `is_active` debe actualizarse a `false`.
*   Los campos `number`, `location`, `status` y `member_id` no se modifican en esta operación.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `DELETE /api/v1/lockers/:id`

*   **Request Body**:

```ts
{}
```

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    location: string;
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
    is_active: boolean;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: Entidad `Locker` y regla de negocio asociada a la baja lógica: un casillero dado de baja no se elimina físicamente, sino que se marca como inactivo.

*   **Application**: Caso de uso `DeleteLockerUseCase`, encargado de validar que el casillero exista, verificar que se encuentre activo y solicitar la actualización del campo `is_active` a `false`.

*   **Infrastructure**: Controlador HTTP para `DELETE /api/v1/lockers/:id`, implementación del repositorio de casilleros utilizando Prisma y persistencia de la baja lógica en base de datos.

## Casos de Borde y Errores
| Escenario                       | Resultado Esperado                                       | Código HTTP               |
| --------------------------------| -------------------------------------------------------- | ------------------------- |
| [El casillero no existe]        | [Error indicando que el casillero no fue encontrado]     | 404 Not Found             |
| El casillero ya está inactivo   | Error indicando que el casillero ya fue dado de baja     | 409 Conflict              |
| Error inesperado al guardar     | Error interno del servidor                               | 500 Server Error          |

## Plan de Implementación
1. Definir el contrato compartido para la baja de casilleros en `@alentapp/shared`.
2. Verificar que el modelo `Locker` tenga el campo `is_active`.
3. Implementar el caso de uso `DeleteLockerUseCase`.
4. Implementar en el repositorio la búsqueda de casillero por `id`.
5. Validar que el casillero exista antes de darlo de baja.
6. Validar que el casillero no se encuentre previamente inactivo.
7. Actualizar el campo `is_active` a `false` usando Prisma.
8. Implementar el endpoint `DELETE /api/v1/lockers/:id`.
9. Agregar prueba de baja lógica exitosa.
10. Agregar prueba de error por casillero inexistente.
11. Agregar prueba de error por casillero ya inactivo.