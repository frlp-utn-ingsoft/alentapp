---
autor: Luana Suarez
fecha: 2026-05-02
titulo: Alta deporte
---

# TDD-0013: Alta deporte

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un administrador del club registre un nievo deporte dentro del sistema Alentapp. Esta funcionalidad permite mantener actualizado el catalogo de deportes ofrecidos por el club, defendiendo su nombre, descripcion y cupo maximo disponible

### User Persona
*   **Nombre**: Administrador del club
*   **Necesidad**: Necesita registrar nueos deportes de forma ordenada, asegurando que cada deporte tenga un nombre identificatorio y un cupo maximo

### Criterios de Aceptación
*   El sistema debera permitir registrar un nuevo deporte indicando 'name', 'descripcion' y 'max_capacity'
*   El sistema debera validar que el campo 'name' sea obligatorio
*   El sistema debera validar que el campo `max_capacity` sea obligatorio y mayor que 0.
*   Al finalizar la creación, el sistema deberá guardar el deporte como activo.
*   Una vez creado el deporte, el campo `name` no deberá ser modificado en futuras operaciones de actualización.

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
*   `description` debe ser obligatoria.
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

| Escenario                              | Resultado Esperado                                  | Código HTTP      |
| -------------------------------------- | --------------------------------------------------- | ---------------- |
| No se envía `name`                     | Error indicando que el nombre es requerido           | 400 Bad Request  |
| No se envía `description`              | Error indicando que la descripción es requerida      | 400 Bad Request  |
| No se envía `max_capacity`             | Error indicando que el cupo máximo es requerido      | 400 Bad Request  |
| `max_capacity` es menor o igual a cero | Error indicando que el cupo debe ser mayor a cero    | 400 Bad Request  |
| Error inesperado al guardar            | Error interno del servidor                           | 500 Server Error |

## Plan de Implementación

1. Definir el contrato compartido para crear deportes en `@alentapp/shared`.
2. Verificar o agregar el modelo `Sport` en Prisma.
3. Implementar la lógica de dominio de `Sport`.
4. Implementar el caso de uso `CreateSportUseCase`.
5. Implementar el repositorio de deportes usando Prisma.
6. Implementar el endpoint `POST /api/v1/sports`.
7. Validar que `name` sea obligatorio.
8. Validar que `description` sea obligatoria.
9. Validar que `max_capacity` sea obligatorio y mayor a cero.
10. Crear el deporte con `is_active` en `true` por defecto.
11. Agregar prueba de creación exitosa de deporte.
12. Agregar prueba de error por `name` faltante.
13. Agregar prueba de error por `description` faltante.
14. Agregar prueba de error por `max_capacity` inválido
