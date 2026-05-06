---
id: 0017
estado: Aprobado
autor: German Altamirano
fecha: 2026-05-05
titulo: Actualización de Deportes
---

# TDD-0017: Actualización de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administradores modificar los datos editables de un deporte existente, respetando la integridad del catálogo de actividades.

Según la regla de negocio de `Sport`, el nombre del deporte no puede modificarse después de la creación. Solo se permite editar la descripción y el cupo máximo.

### User Persona

-   Nombre: Administrador de Deportes
-   Necesidad: Actualizar la descripción o el cupo máximo de un deporte cuando cambia la disponibilidad de espacios, profesores o turnos, sin alterar el nombre del deporte ya usado en inscripciones.

### Criterios de Aceptación

-   El sistema debe permitir actualizar un deporte existente.
-   El sistema debe validar que el deporte exista antes de modificarlo.
-   El sistema debe permitir modificar únicamente `description` y `max_capacity`.
-   El sistema no debe permitir modificar el `name`.
-   El sistema no debe permitir modificar `additional_price` ni `is_federated` desde este caso de uso.
-   El sistema debe validar que el nuevo `max_capacity` sea mayor a cero.
-   El sistema debe validar que el nuevo `max_capacity` no sea menor que la cantidad actual de inscriptos.
-   Si la actualización es correcta, debe retornar los datos actualizados del deporte.

## Diseño Técnico (RFC)

### Modelo de Datos

La actualización operará sobre la entidad `Sport` existente:

-   `id`: UUID. No modificable.
-   `name`: String. No modificable después de la creación.
-   `description`: String. Editable.
-   `max_capacity`: Int. Editable, pero debe ser mayor a cero.
-   `additional_price`: Float. No editable en este caso de uso.
-   `is_federated`: Boolean. No editable en este caso de uso.
-   `updated_at`: DateTime. Se actualiza automáticamente.

Reglas de actualización:

-   No se debe modificar el `id`.
-   No se debe modificar el `name`.
-   Solo se permite actualizar `description` y `max_capacity`.
-   El `max_capacity` debe ser mayor a cero.
-   El `max_capacity` no puede ser menor que la cantidad de socios inscriptos.

### Contrato de API (@alentapp/shared)

-   Endpoint: `PATCH /api/v1/sports/:id`
-   Request Body: `UpdateSportRequest`

```ts
{
    description?: string;
    maxCapacity?: number;
}
```
**Response esperada**: 200 OK

```ts
{
    id: string;
    name: string;
    description: string;
    maxCapacity: number;
    additionalPrice: number;
    isFederated: boolean;
    enrolledCount: number;
    availableSlots: number;
    createdAt: string;
    updatedAt: string;
}
```

## Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Método `update(id, data)` y `countEnrolled(sportId)`).
2. **Servicio de Dominio**: `SportValidator` (Encargado de validar la inmutabilidad del nombre, que `max_capacity` sea mayor a cero, y que no sea menor que la cantidad de inscriptos).
3. **Caso de Uso**: `UpdateSportUseCase` (Orquesta la validación, verifica la existencia del deporte mediante `findById`, y rechaza intentos de modificar campos no permitidos).
4. **Adaptador de Salida**: `PostgresSportRepository` (Actualización usando el método `update` de Prisma y método `countEnrolled` para validar restricciones).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP PATCH que extrae el `id` de la URL, valida que solo se modifiquen `description` y `maxCapacity`, y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                                   | Código HTTP               |
| --------------------------------------- | -------------------------------------------------------------------- | ------------------------- |
| Deporte inexistente                     | Mensaje: "El deporte no existe"                                      | 404 Not Found             |
| Intento de modificar name               | Mensaje: "El nombre del deporte no puede modificarse"                | 400 Bad Request           |
| Intento de modificar precio adicional   | Mensaje: "Solo se permite modificar descripción y cupo máximo"       | 400 Bad Request           |
| Intento de modificar condición federada | Mensaje: "Solo se permite modificar descripción y cupo máximo"       | 400 Bad Request           |
| Cupo máximo menor o igual a cero        | Mensaje: "El cupo máximo debe ser mayor a cero"                      | 400 Bad Request           |
| Cupo menor que inscriptos actuales      | Mensaje: "El cupo máximo no puede ser menor que la cantidad de inscriptos"                     | 409 Conflict              |
| Descripción vacía                       | Mensaje: "La descripción del deporte es obligatoria"                 | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                        | 500 Internal Server Error |
| Actualización exitosa                   | Retorna el deporte actualizado                                       | 200 OK                    |

## Plan de Implementación

1. Crear el tipo compartido UpdateSportRequest.
2. Ampliar SportRepository con el método update(id, data).
3. Implementar countEnrolled(sportId).
4. Crear o reutilizar SportValidator.
5. Implementar UpdateSportUseCase.
6. Validar existencia del deporte mediante findById.
7. Rechazar cualquier intento de modificación de name.
8. Rechazar cualquier campo distinto de description y maxCapacity.
9. Validar que maxCapacity sea mayor a cero.
10. Validar que maxCapacity no sea menor que la cantidad de inscriptos.
11. Crear el endpoint PATCH /api/v1/sports/:id.
12. Consumir el endpoint desde el frontend.
13. Agregar tests de actualización exitosa, deporte inexistente, cambio de nombre, campos no permitidos y cupo inválido.