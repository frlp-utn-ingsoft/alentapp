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

| Escenario                                | Resultado Esperado                                         | Código HTTP      |
| ---------------------------------------- | ---------------------------------------------------------- | ---------------- |
| El casillero no existe                   | Error indicando que el casillero no fue encontrado          | 404 Not Found    |
| No se envía `number`                     | Error indicando que el número de casillero es requerido     | 400 Bad Request  |
| `number` es menor o igual a cero         | Error indicando que el número debe ser mayor a cero         | 400 Bad Request  |
| Ya existe otro casillero con ese número  | Error indicando que el número de casillero ya está en uso   | 409 Conflict     |
| `status` tiene un valor inválido         | Error indicando que el estado del casillero no es válido    | 400 Bad Request  |
| Error inesperado al guardar              | Error interno del servidor                                  | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para modificar casilleros en `@alentapp/shared`.
2. Verificar que el modelo `Locker` exista en Prisma con los campos necesarios.
3. Implementar la lógica de dominio para validar los datos modificables de `Locker`.
4. Implementar el caso de uso `UpdateLockerUseCase`.
5. Implementar en el repositorio la búsqueda de casillero por `id`.
6. Implementar en el repositorio la validación de existencia de otro casillero con el mismo `number`.
7. Implementar la actualización del casillero usando Prisma.
8. Implementar el endpoint `PUT /api/v1/lockers/:id`.
9. Agregar prueba de modificación exitosa de casillero.
10. Agregar prueba de error por casillero inexistente.
11. Agregar prueba de error por número duplicado.
12. Agregar prueba de error por estado inválido.
