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

## Diseño Técnico (RFC)

### Modelo de Datos

Se utilizará la entidad `Sport` para representar los deportes disponibles dentro del sistema.

*   `id`: UUID. Identificador único del deporte.
*   `name`: String. Nombre del deporte. Obligatorio.
*   `description`: String. Descripción del deporte.
*   `max_capacity`: Number. Cupo máximo permitido. Obligatorio y mayor a cero.
*   `is_active`: Boolean. Indica si el deporte se encuentra activo. Valor por defecto: `true`.

Restricciones:

*   `name` debe ser obligatorio.
*   `max_capacity` debe ser mayor a cero.
*   `is_active` se inicializa en `true` al crear un deporte.
*   El campo `name` no podrá modificarse en futuras operaciones de actualización.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `POST /api/v1/sports`

*   **Request Body**:

```ts
{
    name: string;
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

*   **Domain**: Entidad `Sport` y reglas de negocio asociadas a la creación de deportes: nombre obligatorio, cupo máximo mayor a cero y estado activo por defecto.

*   **Application**: Caso de uso `CreateSportUseCase`, encargado de validar los datos de entrada y solicitar la creación del deporte.

*   **Infrastructure**: Controlador HTTP para `POST /api/v1/sports`, implementación del repositorio de deportes utilizando Prisma y persistencia del nuevo deporte en base de datos.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| [Ej: DNI ya registrado]     | [Error de validación con mensaje claro]       | 409 Conflict              |
| [Ej: Formato email inválido]| [Error de validación de formato]              | 400 Bad Request           |

## Plan de Implementación
1. [Paso 1: ej. Definir tipos en @alentapp/shared]
2. [Paso 2: ej. Implementar entidad en Domain]