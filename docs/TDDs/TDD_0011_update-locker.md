---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Modificacion de casillero
---

# TDD-[0011]: [Modificación de casillero]
]

## Contexto de Negocio (PRD)

### Objetivo
[Permitir que un administrador del club modifique los datos basicos de un casillero existente dentor del sistema Alentapp. Esta funcionalidad permite corregir o actualizar la información de un casillero ya registrado, manteniendo la consistencia de los datos y evitando que existan casilleros duplicados.]

### User Persona
*   **Nombre**: [Administrador del club
*   **Necesidad**: [Actualizar la informacion de un casillero existente, asegurando que el numero del casillero siga siendo valido y que el estado restringido refleje su situacion actual]

### Criterios de Aceptación

*   El sistema deberá permitir modificar un casillero existente.
*   El sistema deberá validar que el casillero exista antes de actualizarlo.
*   El sistema deberá permitir modificar los campos `number`, `location` y `status`.
*   El sistema deberá validar que el campo `number` sea obligatorio.
*   El sistema deberá validar que el campo `number` sea mayor a cero.
*   El sistema deberá validar que el campo `location` sea obligatorio.
*   El sistema deberá validar que no exista otro casillero registrado con el mismo `number`.
*   El sistema deberá validar que el campo `status` tenga un valor permitido.
*   El sistema no deberá modificar el campo `member_id` en esta operación.
*   Al finalizar la modificación, el sistema deberá guardar los nuevos datos del casillero.
*   Si el casillero no existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos
Se utilizará la entidad 'locker' existente para la actualizar los datos basicos de un casillero. 
*   `id`: UUID. Identificador único del casillero.
*   `number`: Number. Número identificatorio del casillero. Obligatorio, único y mayor a cero.
*   `location`: String. Ubicacion fisica o referencial del casillero en el club
*   `status`: String. Estado actual del casillero.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero
*   `is_active`: Boolean. Indica si el casillero se encuentra activo.

Estados permitido para 'status':
*   'Aviable': casillero disponible.
*   'Assidned': casillero asignado.
*   'Maintenance': casillero en mantenimiento.

Restricciones:
*   `id` debe corresponder a un casillero existente.
*   `number` debe ser único.
*   `number` debe ser mayor a cero.
*   `location` debe ser obligatoria.
*   `status` debe pertenecer a los estados permitidos.
*   `member_id` no se modifica en esta operación.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/lockers/:id`

*   **Request Body**:

```ts
{
    number: number;
    location: string,
    status: "Available" | "Assigned" | "Maintenance";
}
```

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    location: string;
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
    is_active: boolean;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: Entidad `Locker` y reglas de negocio asociadas a la modificación de casilleros: número obligatorio, número único, número mayor a cero, estado válido y conservacion del socio asignado.

*   **Application**: Caso de uso `UpdateLockerUseCase`, encargado de validar la existencia del casillero, verificar los datos recibidos, controlar que no exista otro casillero con el mismo número y solicitar la actualización.

*   **Infrastructure**: Controlador HTTP para `PUT /api/v1/lockers/:id`, implementación del repositorio de casilleros utilizando Prisma y persistencia de los cambios en base de datos.

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                          | Código HTTP      |
| --------------------------------------- | ----------------------------------------------------------- | ---------------- |
| El casillero no existe                  | Error indicando que el casillero no fue encontrado           | 404 Not Found    |
| No se envía `number`                    | Error indicando que el número de casillero es requerido      | 400 Bad Request  |
| `number` es menor o igual a cero        | Error indicando que el número debe ser mayor a cero          | 400 Bad Request  |
| No se envía `location`                  | Error indicando que la ubicación es requerida                | 400 Bad Request  |
| Ya existe otro casillero con ese número | Error indicando que el número de casillero ya está en uso    | 409 Conflict     |
| `status` tiene un valor inválido        | Error indicando que el estado del casillero no es válido     | 400 Bad Request  |
| Error inesperado al guardar             | Error interno del servidor                                   | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para modificar casilleros en `@alentapp/shared`.
2. Verificar que el modelo `Locker` exista en Prisma con los campos necesarios.
3. Implementar la lógica de dominio para validar los datos modificables de `Locker`.
4. Implementar el caso de uso `UpdateLockerUseCase`.
5. Implementar en el repositorio la búsqueda de casillero por `id`.
6. Implementar en el repositorio la validación de existencia de otro casillero con el mismo `number`.
7. Validar que 'number' sea obligatorio y mayor que cero
8. Validar que 'location' sea obligatorio
9. Validar que `status` tenga un valor permitido.
10. Actualizar únicamente los campos `number`, `location` y `status`.
11. Mantener el valor actual de `member_id`.
12. Implementar el endpoint `PUT /api/v1/lockers/:id`.
13. Agregar prueba de modificación exitosa de casillero.
14. Agregar prueba de error por casillero inexistente.
15. Agregar prueba de error por número duplicado.
16. Agregar prueba de error por ubicación faltante.
17. Agregar prueba de error por estado inválido.
