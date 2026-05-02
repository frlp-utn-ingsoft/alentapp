---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Modificacion de deporte
---

# TDD-[0014]: Modificacion de deporte

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
*   El sistema deberá validar que el campo `max_capacity` sea mayor a cero.
*   El sistema no deberá permitir modificar el campo `name`.
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
*   `description` puede modificarse.
*   `max_capacity` puede modificarse, pero debe ser mayor a cero.

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
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| [Ej: DNI ya registrado]     | [Error de validación con mensaje claro]       | 409 Conflict              |
| [Ej: Formato email inválido]| [Error de validación de formato]              | 400 Bad Request           |

## Plan de Implementación
1. [Paso 1: ej. Definir tipos en @alentapp/shared]
2. [Paso 2: ej. Implementar entidad en Domain]