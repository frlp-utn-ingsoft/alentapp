---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Modificacion de deporte
---

# TDD-0014: Modificacion de deporte

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrador del club modifique los datos editables de un deporte existente dentro del sistema Alentapp.

Esta funcionalidad permite actualizar la descripción y el cupo máximo de un deporte ya registrado, manteniendo la consistencia de la información y respetando que el nombre del deporte no puede modificarse luego de su creación.

### User Persona

*   **Nombre**: Administrador del club
*   **Necesidad**: Actualizar la información operativa de un deporte, como su descripción o cupo máximo, sin alterar su nombre identificatorio.

### Criterios de Aceptación

*   El sistema deberá permitir modificar un deporte existente.
*   El sistema deberá validar que el deporte exista antes de actualizarlo.
*   El sistema deberá permitir modificar únicamente los campos `description` y `max_capacity`.
*   El sistema no deberá permitir modificar el campo `name`.
*   El sistema deberá validar que el campo `description` sea obligatorio.
*   El sistema deberá validar que el campo `max_capacity` sea obligatorio.
*   El sistema deberá validar que el campo `max_capacity` sea mayor a cero.
*   Al finalizar la modificación, el sistema deberá guardar los nuevos datos del deporte.
*   Si el deporte no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Sport` existente para actualizar los datos editables de un deporte.

*   `id`: UUID. Identificador único del deporte.
*   `name`: String. Nombre del deporte. No modificable luego de la creación.
*   `description`: String. Descripción del deporte. Campo modificable.
*   `max_capacity`: Number. Cupo máximo permitido. Campo modificable, obligatorio y mayor a cero.
*   `is_active`: Boolean. Indica si el deporte se encuentra activo dentro del sistema.

Restricciones:

*   `id` debe corresponder a un deporte existente.
*   `name` no debe poder modificarse.
*   `description` debe ser obligatoria.
*   `max_capacity` debe ser mayor a cero.
*   Solo se actualizan los campos `description` y `max_capacity`.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/sports/:id`

*   **Request Body**:

```ts
{
    description: string;
    max_capacity: number;
}
```

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

*   **Domain**: Entidad `Sport` y reglas de negocio asociadas a la modificación: el campo `name` no puede modificarse y `max_capacity` debe ser mayor a cero.

*   **Application**: Caso de uso `UpdateSportUseCase`, encargado de validar la existencia del deporte, verificar que solo se modifiquen los campos permitidos y solicitar la actualización.

*   **Infrastructure**: Controlador HTTP para `PUT /api/v1/sports/:id`, implementación del repositorio de deportes utilizando Prisma y persistencia de los cambios en base de datos.

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP      |
| -------------------------------------- | ------------------------------------------------------- | ---------------- |
| El deporte no existe                   | Error indicando que el deporte no fue encontrado         | 404 Not Found    |
| Se intenta modificar `name`            | Error indicando que el nombre del deporte es inmutable   | 400 Bad Request  |
| No se envía `description`              | Error indicando que la descripción es requerida          | 400 Bad Request  |
| No se envía `max_capacity`             | Error indicando que el cupo máximo es requerido          | 400 Bad Request  |
| `max_capacity` es menor o igual a cero | Error indicando que el cupo debe ser mayor a cero        | 400 Bad Request  |
| Error inesperado al guardar            | Error interno del servidor                               | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para modificar deportes en `@alentapp/shared`.
2. Verificar que el modelo `Sport` exista en Prisma con los campos necesarios.
3. Implementar la lógica de dominio de `Sport`.
4. Implementar el caso de uso `UpdateSportUseCase`.
5. Implementar en el repositorio la búsqueda de deporte por `id`.
6. Validar que el deporte exista antes de modificarlo.
7. Validar que no se intente modificar el campo `name`.
8. Validar que `description` sea obligatoria.
9. Validar que `max_capacity` sea obligatorio y mayor a cero.
10. Actualizar únicamente los campos `description` y `max_capacity`.
11. Implementar el endpoint `PUT /api/v1/sports/:id`.
12. Agregar prueba de modificación exitosa de deporte.
13. Agregar prueba de error por deporte inexistente.
14. Agregar prueba de error por intento de modificar `name`.
15. Agregar prueba de error por `description` faltante.
16. Agregar prueba de error por `max_capacity` inválido.