---
autor: [Luana Suarez]
fecha: [2026-05-01]
titulo: [Modificacion de casillero]
---

# TDD-[XXXX]: [Modificación de casillero]
]

## Contexto de Negocio (PRD)

### Objetivo
[Permitir que un administrador del club modifique los datos basicos de un casillero existente dentor del sistema Alentapp. Esta funcionalidad permite corregir o actualizar la información de un casillero ya registrado, manteniendo la consistencia de los datos y evitando que existan casilleros duplicados.]

### User Persona
*   **Nombre**: [Administrador del club]
*   **Necesidad**: [Actualizar la informacion de un casillero existente, asegurando que el numero del casillero siga siendo valido y que el estado restringido refleje su situacion actual]

### Criterios de Aceptación
*   [El sistema debera permitir modificar un casillero existente]
*   [El sistema deberá validar que el casillero exista antes de actualizarlo..]
*   [El sistema deberá validar que el campo `number` sea obligatorio.]
*   El sistema debera validar que el campo 'number sea mayor que cero'.
*   El sistema debera validar que no exista otro casillero registrado con el mismo 'number'.
*   El sistema deberá validar que el campo 'status' tenga un valor permitido.
*   Al finalizar la modificación, el sistema deberá guardar los nuevos datos del casillero.
*   Si el casillero no existe, el sistema deberá rechazar la operación e informar el error correspondiente.
## Diseño Técnico (RFC)

### Modelo de Datos
Se utilizará la entidad 'locker' existente para la actualizar los datos basicos de un casillero. 
*   `id`: UUID. Identificador único del casillero.
*   `number`: Number. Número identificatorio del casillero. Obligatorio, único y mayor a cero.
*   `status`: String. Estado actual del casillero.
*   `is_active`: Boolean. Indica si el casillero se encuentra activo.

Estados permitido para 'status':
*   'Aviable': casillero disponible.
*   'Assidned': casillero asignado.
*   'Maintenance': casillero en mantenimiento.

Restricciones:
*   'id' debe corresponder a un casilelro existente.
*   'number' debe ser unico.
*   'number'debe er mayor que cero.
*   'status' debe pertenecer a lso estados permitidos.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/lockers/:id`

*   **Request Body**:

```ts
{
    number: number;
    status: "Available" | "Assigned" | "Maintenance";
}
```

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    status: "Available" | "Assigned" | "Maintenance";
    is_active: boolean;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: Entidad `Locker` y reglas de negocio asociadas a la modificación de casilleros: número obligatorio, número único, número mayor a cero y estado válido.

*   **Application**: Caso de uso `UpdateLockerUseCase`, encargado de validar la existencia del casillero, verificar los datos recibidos, controlar que no exista otro casillero con el mismo número y solicitar la actualización.

*   **Infrastructure**: Controlador HTTP para `PUT /api/v1/lockers/:id`, implementación del repositorio de casilleros utilizando Prisma y persistencia de los cambios en base de datos.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| [Ej: DNI ya registrado]     | [Error de validación con mensaje claro]       | 409 Conflict              |
| [Ej: Formato email inválido]| [Error de validación de formato]              | 400 Bad Request           |

## Plan de Implementación
1. [Paso 1: ej. Definir tipos en @alentapp/shared]
2. [Paso 2: ej. Implementar entidad en Domain]