---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Baja de deporte
---

# TDD-0015: Baja de deporte

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrador del club dé de baja un deporte existente dentro del sistema Alentapp.

Esta funcionalidad permite quitar un deporte del uso operativo del sistema sin eliminar físicamente su registro de la base de datos. De esta forma, se mantiene la información histórica y se evita perder datos necesarios para consultas futuras.

### User Persona

*   **Nombre**: Administrador del club
*   **Necesidad**: Dar de baja deportes que ya no se ofrecen en el club, evitando que sigan disponibles para futuras operaciones.

### Criterios de Aceptación

*   El sistema deberá permitir dar de baja un deporte existente.
*   El sistema deberá validar que el deporte exista antes de darlo de baja.
*   El sistema no deberá eliminar físicamente el deporte de la base de datos.
*   Al finalizar la baja, el sistema deberá marcar el deporte como inactivo.
*   Un deporte dado de baja no deberá aparecer como activo para futuras operaciones.
*   Si el deporte no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Sport` existente para representar los deportes del sistema.

Para la baja de un deporte no se realizará eliminación física del registro. En su lugar, se actualizará el campo `is_active` a `false`.

*   `id`: UUID. Identificador único del deporte.
*   `name`: String. Nombre del deporte.
*   `description`: String. Descripción del deporte.
*   `max_capacity`: Number. Cupo máximo permitido.
*   `is_active`: Boolean. Indica si el deporte se encuentra activo dentro del sistema.

Restricciones:

*   `id` debe corresponder a un deporte existente.
*   La baja no debe eliminar físicamente el registro.
*   Al dar de baja el deporte, `is_active` debe actualizarse a `false`.
*   Los campos `name`, `description` y `max_capacity` no se modifican en esta operación.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `DELETE /api/v1/sports/:id`

*   **Request Body**: no aplica

*   **Response Body**:

```ts
{
    id: string;
    name: string;
    description: string;
    max_capacity: number;
    is_active: boolean;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: Entidad `Sport` y regla de negocio asociada a la baja lógica: un deporte dado de baja no se elimina físicamente, sino que se marca como inactivo.

*   **Application**: Caso de uso `DeleteSportUseCase`, encargado de validar que el deporte exista, verificar que se encuentre activo y solicitar la actualización del campo `is_active` a `false`.

*   **Infrastructure**: Controlador HTTP para `DELETE /api/v1/sports/:id`, implementación del repositorio de deportes utilizando Prisma y persistencia de la baja lógica en base de datos.

## Casos de Borde y Errores

| Escenario                   | Resultado Esperado                                  | Código HTTP      |
| --------------------------- | --------------------------------------------------- | ---------------- |
| El deporte no existe        | Error indicando que el deporte no fue encontrado     | 404 Not Found    |
| El deporte ya está inactivo | Error indicando que el deporte ya fue dado de baja   | 409 Conflict     |
| Error inesperado al guardar | Error interno del servidor                           | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para la baja de deportes en `@alentapp/shared`.
2. Verificar que el modelo `Sport` tenga el campo `is_active`.
3. Implementar el caso de uso `DeleteSportUseCase`.
4. Implementar en el repositorio la búsqueda de deporte por `id`.
5. Validar que el deporte exista antes de darlo de baja.
6. Validar que el deporte no se encuentre previamente inactivo.
7. Actualizar el campo `is_active` a `false` usando Prisma.
8. Implementar el endpoint `DELETE /api/v1/sports/:id`.
9. Agregar prueba de baja lógica exitosa.
10. Agregar prueba de error por deporte inexistente.
11. Agregar prueba de error por deporte ya inactivo.