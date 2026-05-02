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
[Descripción de cambios en Prisma o nuevas entidades.]
*   `campo`: Tipo (Restricciones).

### Contrato de API (@alentapp/shared)
[Definición de endpoints y tipos compartidos.]
*   **Endpoint**: `METHOD /api/v1/[recurso]`
*   **Request Body**:
```ts
{
    // propiedades
}
```

### Componentes de Arquitectura Hexagonal
[Cómo se distribuye la lógica en las capas.]
*   **Domain**: [Entidades, Value Objects, Reglas de negocio]
*   **Application**: [Casos de Uso, Puertos de Salida]
*   **Infrastructure**: [Adaptadores, Controladores, Implementación de Repositorios]

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| [Ej: DNI ya registrado]     | [Error de validación con mensaje claro]       | 409 Conflict              |
| [Ej: Formato email inválido]| [Error de validación de formato]              | 400 Bad Request           |

## Plan de Implementación
1. [Paso 1: ej. Definir tipos en @alentapp/shared]
2. [Paso 2: ej. Implementar entidad en Domain]