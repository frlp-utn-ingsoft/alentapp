---
autor: Luana Suarez
fecha: 2026-05-02
titulo: Baja del casillero
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
*   El sistema debera validar que el casillero no haya sido dado de baja previamente.
*   El sistema no deberá eliminar físicamente el casillero de la base de datos.
*   Al finalizar la baja, el sistema debera registrar la fecha en el campo 'deleted _at'
*   Un casillero dado de baja no deberá aparecer como disponible para futuras operaciones.
*   Si el casillero no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)
### Modelo de Datos

Se utilizará la entidad `Locker` existente para representar los casilleros del sistema.

Para la baja de un casillero no se realizará eliminación física del registro. En su lugar, se actualizará el campo i.

*   `id`: UUID. Identificador único del casillero.
*   `number`: Int. Número identificatorio del casillero.
*   `location`: String. Ubicación física del casillero dentro del club. Debe pertenecer a una lista de locaciones permitidas.
*   `status`: String. Estado actual del casillero.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero.
*   `deleted_at`: Date | null. Fecha de baja lógica. Si es `null`, el casillero se considera activo.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `DELETE /api/v1/lockers/:id`

*   **Request Body**: no aplica

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    location: "Hall" | "Vestibulo" | "Pasillo" | "Gimnasio" | "Administracion";
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
    deleted_at: string | nul; //fromato yyyy-mm-dd
}
```

### Componentes de Arquitectura Hexagonal

*  **Domain**: Entidad `Locker` y regla de negocio asociada a la baja lógica: el casillero no se elimina físicamente, sino que se registra su fecha de baja en `deleted_at`.

*   **Application**: Caso de uso `DeleteLockerUseCase`, encargado de validar la existencia del casillero, verificar que no haya sido dado de baja previamente y solicitar la actualización de `deleted_at`.

*   **Infrastructure**: Controlador HTTP para `DELETE /api/v1/lockers/:id` y repositorio de casilleros implementado con Prisma.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                     | Código HTTP      |
| -------------------------------- | ------------------------------------------------------ | ---------------- |
| El casillero no existe           | Error indicando que el casillero no fue encontrado      | 404 Not Found    |
| El casillero ya fue dado de baja | Error indicando que el casillero ya tiene fecha de baja | 409 Conflict     |
| Error inesperado al guardar      | Error interno del servidor                             | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para la baja de casilleros en `@alentapp/shared`.
2. Verificar que el modelo `Locker` tenga el campo `deleted_at`.
3. Implementar el caso de uso `DeleteLockerUseCase`.
4. Buscar el casillero por `id`.
5. Validar que el casillero exista.
6. Validar que `deleted_at = null`.
7. Actualizar `deleted_at` con la fecha actual.
8. Implementar el endpoint `DELETE /api/v1/lockers/:id`.
9. Filtrar en las consultas operativas los casilleros con `deleted_at` distinto de `null`.
10. Agregar pruebas para baja lógica exitosa y casos de error.