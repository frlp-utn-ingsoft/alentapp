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