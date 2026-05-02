---
autor: [Luana Suarez]
fecha: [2026-05-02]
titulo: [Alta deporte]
---

# TDD-[0013]: [Alta deporte]

## Contexto de Negocio (PRD)

### Objetivo
[Permitir que un administrador del club registre un nievo deporte dentro del sistema Alentapp. Esta funcionalidad permite mantener actualizado el catalogo de deportes ofrecidos por el club, defendiendo su nombre, descripcion y cupo maximo disponible]

### User Persona
*   **Nombre**: [Administrador del club]
*   **Necesidad**: [Necesita registrar nueos deportes de forma ordenada, asegurando que cada deporte tenga un nombre identificatorio y un cupo maximo]

### Criterios de Aceptación
*   [El sistema debera permitir registrar un nuevo deporte indicando 'name', 'descripcion' y 'max_capacity']
*   [El sistema debera validar que el campo 'name' sea obligatorio]
*   [El sistema debera validar que el campo `max_capacity` sea obligatorio y mayor que 0.]
*   Al finalizar la creación, el sistema deberá guardar el deporte como activo.
*   Una vez creado el deporte, el campo `name` no deberá ser modificado en futuras operaciones de actualización.

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