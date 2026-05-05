---
autor: Luana Suarez
fecha: 2026-05-01
titulo: Alta de casillero
---

# TDD-0010: Alta casillero

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un administrador del club registre un nuevo casillero dentro del sistema Alentapp.
Esta funcionalidad permite administrar los casilleros disponibles del club, evitando que existan casilleros duplicados y dejando cada nuevo casillero creado en un estado inicial válido para futuras operaciones.

### User Persona
*   **Nombre**: [Administrador del club]
*   **Necesidad**: [ Registrar nuevos casilleros de manera ordenada, asegurando que cada casillero tenga un número único, una ubicación válida y pueda ser gestionado posteriormente por el sistema.]

### Criterios de Aceptación

*   El sistema deberá permitir registrar un nuevo casillero ingresando su número identificatorio y ubicación.
*   El sistema deberá validar que el campo `number` sea obligatorio.
*   El sistema deberá validar que el campo `number` sea mayor a cero.
*   El sistema deberá validar que el campo `location` sea obligatorio.
*   El sistema deberá validar que el campo `location` pertenezca a una locación permitida.
*   El sistema deberá validar que no exista otro casillero registrado con el mismo `number`.
*   Al finalizar la creación, el sistema deberá guardar el casillero con estado `Available`.
*   Al finalizar la creación, el sistema deberá guardar el casillero como activo, es decir deleted_at = null.
*   Al finalizar la creación, el sistema deberá guardar el casillero sin socio asignado, member_id = null.
*   Si el número de casillero ya existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos
Se utilizará la entidad `Locker` para representar los casilleros físicos disponibles en el club.

*   `id`: UUID. Identificador único del casillero.
*   `number`: Int. Número identificatorio del casillero. Obligatorio, único y mayor a cero.
*   `location`: String. Ubicacion fisica o referencia del casillero dentro del club.
*   `status`: String. Estado actual del casillero. Valor inicial: `Available`.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero. Al crear un casillero nuevo, este campo se inicializa en `null`.
*   `deleted_at`: Date | null. Fecha de baja logica. Valor inicial : 'null'

Locaciones permitidas para `location`:

*   `Hall`
*   `Vestibulo`
*   `Pasillo`
*   `Gimnasio`
*   `Administracion`

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `POST /api/v1/lockers`

*   **Request Body**:

```ts
{
    number: number;
    location: "Hall" | "Vestibulo" | "Pasillo" | "Gimnasio" | "Administracion";
}
```

*   **Response Body**:

```ts
{
    id: string;
    number: number;
    location: "Hall" | "Vestibulo" | "Pasillo" | "Gimnasio" | "Administracion";
    status: "Available" | "Assigned" | "Maintenance";
    member_id: string | null;
    deleted_at: date | null;
}
```

### Componentes de Arquitectura Hexagonal


*   **Domain**: Entidad `Locker` y reglas de negocio asociadas a la creación de casilleros: número obligatorio, número único, número mayor a cero, ubicación obligatoria, ubicación perteneciente a una locación permitida, estado inicial `Available` y casillero sin socio asignado.

*   **Application**: Caso de uso `CreateLockerUseCase`, encargado de validar los datos de entrada, verificar que no exista otro casillero con el mismo número y solicitar la persistencia del nuevo casillero.

*   **Infrastructure**: Controlador HTTP para `POST /api/v1/lockers` y repositorio de casilleros implementado con Prisma.


## Casos de Borde y Errores

| Escenario                             | Resultado Esperado                                      | Código HTTP      |
| ------------------------------------- | ------------------------------------------------------- | ---------------- |
| No se envía `number`                  | Error indicando que el número de casillero es requerido | 400 Bad Request  |
| `number` es menor o igual a cero      | Error indicando que el número debe ser mayor a cero     | 400 Bad Request  |
| Ya existe un casillero con ese número | Error indicando que el número de casillero ya existe    | 409 Conflict     |
| No se envía `location`                | Error indicando que la ubicación es requerida           | 400 Bad Request  |
| `location` tiene un valor inválido    | Error indicando que la ubicación no es válida           | 400 Bad Request  |
| Error inesperado al guardar           | Error interno del servidor                              | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para crear casilleros en `@alentapp/shared`.
2. Verificar o agregar el modelo `Locker` en Prisma.
3. Implementar la validacion de `number`.
4. Implementar  la validacion de `location`.
5. Validar que no exista otro casillero con el mismo `number`.
6. Crear el casillero con `status = Avilable `.
7. Crear el casillero con `member_id = null `.
8. Crear el casillero con `delete_at = null `.
9. Implementar el caso de uso `CreateLockerUseCase `.
10. Implementar el endpoint `POST /api/v1/lockers`
11. Agregar pruebas de creación exitosa y casos de error.
