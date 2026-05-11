---
autor: Fermin Etchanchú Paoltroni
fecha: 2026-05-03
titulo: Modificación de Deportes
---

# TDD-0005: Modificación de Deportes

## Contexto de Negocio (PRD)

### Objetivo

Permitir al área administrativa corregir la description y la max_capacity de un deporte existente, manteniendo fijo su nombre para no romper la trazabilidad de inscripciones y la identificación pública del deporte.

### User Persona

*   **Nombre**: Administrativo.
*   **Necesidad**: Actualizar rápidamente un deporte desde la tabla de administración cuando cambia su max_capacity o su description, sin poder renombrarlo por error.

### Criterios de Aceptación

*   El sistema debe permitir editar solo `description` y `max_capacity`.
*   El sistema debe impedir que `name` sea modificado.
*   El sistema debe validar que `max_capacity` sea mayor a cero si se actualiza.
*   El sistema debe devolver los datos actualizados del deporte.

## Diseño Técnico (RFC)

### Modelo de Datos

La entidad `Sport` conserva los siguientes campos relevantes para la actualización:

- `id`: Identificador único universal (UUID).
- `name`: Cadena de texto, único e inmutable después de la creación.
- `description`: Cadena de texto.
- `max_capacity`: Entero positivo mayor a cero.
- `additional_price`: Número decimal.
- `requires_medical_certificate`: Booleano.

### Contrato de API (@alentapp/shared)

En `@alentapp/shared` se definirán los contratos para mantener el tipado compartido entre `@alentapp/api` y `@alentapp/web`.

- Endpoint: `PUT /api/v1/sports/:id`
- Request Body (UpdateSportRequest):

```ts
{
    description?: string;
    max_capacity?: number;
}
```

### Componentes de Arquitectura Hexagonal

*   **Domain**: `SportRepository` con `update(id, data)` y `findById(id)`, más `SportValidator` para bloquear cambios en `name`.
*   **Application**: `UpdateSportUseCase` para validar y orquestar la edición.
*   **Infrastructure**: `PostgresSportRepository` como adaptador de salida.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                                  | Código HTTP               |
| -------------------------------- | ------------------------------------------------------------------- | ------------------------- |
| Deporte inexistente              | Mensaje: "El deporte no existe"                                     | 404 Not Found             |
| `max_capacity` menor o igual a 0 | Mensaje de validación: "La capacidad debe ser mayor a cero"         | 400 Bad Request           |
| Intento de modificar `name`      | Mensaje de validación: "El nombre del deporte no puede modificarse" | 400 Bad Request           |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"                       | 500 Internal Server Error |

## Plan de Implementacion

1. Definir `UpdateSportRequest` en `@alentapp/shared`.
2. Ampliar el `SportRepository` en `src/domain` con el método `update`.
3. Implementar `SportValidator` y `UpdateSportUseCase` en `src/application`.
4. Agregar `SportController` en `src/delivery` y `PostgresSportRepository` en `src/infrastructure`.
5. Consumir la edición desde `@alentapp/web` a través de `sports.ts`.
