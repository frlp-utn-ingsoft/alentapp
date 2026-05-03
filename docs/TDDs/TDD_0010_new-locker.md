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
*   Al finalizar la creación, el sistema deberá guardar el casillero como activo.
*   Al finalizar la creación, el sistema deberá guardar el casillero sin socio asignado.
*   Si el número de casillero ya existe, el sistema deberá rechazar la operación e informar el error correspondiente.

## Diseño Técnico (RFC)

### Modelo de Datos
Se utilizará la entidad `Locker` para representar los casilleros físicos disponibles en el club.

*   `id`: UUID. Identificador único del casillero.
*   `number`: Int. Número identificatorio del casillero. Obligatorio, único y mayor a cero.
*   `location`: String. Ubicacion fisica o referencia del casillero dentro del club.
*   `status`: String. Estado actual del casillero. Valor inicial: `Available`.
*   `is_active`: Boolean. Indica si el casillero se encuentra activo. Valor por defecto: `true`.
*   `member_id`: UUID | null. Identificador del socio asignado al casillero. Al crear un casillero nuevo, este campo se inicializa en `null`.

Estados contemplados para `status`:

*   `Available`: casillero disponible.
*   `Assigned`: casillero asignado.
*   `Maintenance`: casillero en mantenimiento.

Restricciones:

*   `number` debe ser único.
*   `number` debe ser mayor a cero.
*   `status` se inicializa en `Available`.
*   `is_active` se inicializa en `true`.
*   `member_id` se inicializa en `null`.
*   `location` debe ser obligatoria.

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
    is_active: boolean;
}
```

### Componentes de Arquitectura Hexagonal


*   **Domain**: Entidad `Locker` y reglas de negocio asociadas a la creación de casilleros: número obligatorio, número único, número mayor a cero, ubicación obligatoria, ubicación perteneciente a una locación permitida, estado inicial `Available` y casillero sin socio asignado.

*   **Application**: Caso de uso `CreateLockerUseCase`, encargado de validar los datos de entrada, verificar que no exista otro casillero con el mismo número y solicitar la persistencia del nuevo casillero.

*   **Infrastructure**: Controlador HTTP para `POST /api/v1/lockers`, implementación del repositorio de casilleros utilizando Prisma y persistencia en base de datos.
## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                      | Código HTTP      |
| -------------------------------------- | ------------------------------------------------------- | ---------------- |
| No se envía `number`                   | Error indicando que el número de casillero es requerido | 400 Bad Request  |
| `number` es menor o igual a cero       | Error indicando que el número debe ser mayor a cero     | 400 Bad Request  |
| No se envía `location`                 | Error indicando que la ubicación es requerida           | 400 Bad Request  |
| `location` tiene un valor inválido     | Error indicando que la ubicación no es válida           | 400 Bad Request  |
| Ya existe un casillero con ese número  | Error indicando que el casillero ya existe              | 409 Conflict     |
| Error inesperado al guardar            | Error interno del servidor                              | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para crear casilleros en `@alentapp/shared`.
2. Verificar o agregar el modelo `Locker` en Prisma.
3. Implementar la lógica de dominio de `Locker`.
4. Implementar el caso de uso `CreateLockerUseCase`.
5. Implementar el repositorio de casilleros con Prisma.
6. Implementar el endpoint `POST /api/v1/lockers`.
7. Validar que `number` sea obligatorio y mayor a cero.
8. Validar que `location` sea obligatoria y pertenezca a una locación permitida.
9. Validar que no exista otro casillero con el mismo `number`.
10. Crear el casillero con `status` en `Available`.
11. Crear el casillero con `member_id` en `null`.
12. Crear el casillero con `is_active` en `true`.
13. Agregar prueba de creación exitosa de casillero.
14. Agregar prueba de error por número duplicado.
15. Agregar prueba de error por número inválido.
16. Agregar prueba de error por ubicación faltante.
17. Agregar prueba de error por ubicación inválida.
