---

## id: 7003
estado: Revision
autor: Naim Guarino
fecha: 2026-05-03
titulo: Eliminación de Deportes (Sport)

# TDD-7003: Eliminación de Deportes (Sport)

## Contexto de Negocio (PRD)

### Objetivo

Permitir dar de baja un deporte del **catálogo visible** cuando deja de ofrecerse o se cargó por error, mediante **borrado lógico**: el registro de `Sport` **permanece** en base (auditoría, reportes, FK de `Enrollment` intactas) pero deja de considerarse activo para altas, listados y operaciones normales.

### User Persona

- Nombre: Coordinación deportiva / administrativo del club.
- Necesidad: Ocultar o discontinuar un deporte sin perder historial ni romper inscripciones existentes que referencian `sport_id`.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita en la interfaz antes de invocar la baja, en línea con la experiencia de eliminación de socios.
- El sistema debe validar que exista un deporte **activo** (`deleted_at` nulo) antes de darlo de baja.
- El sistema debe aplicar **borrado lógico** (p. ej. setear `deleted_at` a la fecha/hora actual), **sin** `DELETE` físico de la fila `Sport`.
- Las filas de `Enrollment` siguen apuntando al mismo `id`; no se requiere eliminar ni modificar inscripciones para ejecutar esta baja.
- La respuesta HTTP de éxito debe ser coherente con el estándar del API (p. ej. `204 No Content`).

## Diseño Técnico (RFC)

### Modelo de datos

- Campo de baja lógica en `Sport`: `**deleted_at`** (`DateTime?`, `null` = activo, valor = momento de baja).
- `Enrollment.sport_id` → `Sport.id` (FK sin cambio): al no borrar la fila padre, la integridad referencial se mantiene.

**Unicidad de `name` (UK):** debe aplicarse solo entre deportes **activos** (`deleted_at IS NULL`), para permitir en el futuro un alta con el mismo nombre que un deporte ya dado de baja lógicamente. En PostgreSQL/Prisma suele resolverse con **índice único parcial** (`UNIQUE (name) WHERE deleted_at IS NULL`) en migración SQL o convención documentada en el equipo.

### Contrato de API (@alentapp/shared)

No se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/sports/:id`
- Request Body: ninguno
- Response: `204 No Content` en caso de éxito

### Componentes de Arquitectura Hexagonal

1. **Puerto:** `SportRepository` (métodos `findActiveById(id)` —o `findById` que ignore borrados según convención—, `softDelete(id)`).
2. **Caso de uso:** `DeleteSportUseCase` (verifica que el deporte exista y esté activo; ejecuta `softDelete`).
3. **Adaptador de salida:** `PostgresSportRepository` (`update` con `deleted_at = now()` en lugar de `delete` físico).
4. **Adaptador de entrada:** `SportController` (ruta `DELETE`, respuesta 204, mapeo de errores).

## Casos de Borde y Errores


| Escenario                                                    | Resultado esperado                                                                  | Código HTTP               |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------- |
| Deporte inexistente o ya dado de baja (`deleted_at` no nulo) | Mensaje: "No existe un deporte con ese ID" (el catálogo no expone borrados lógicos) | 404 Not Found             |
| `id` con formato inválido                                    | Mensaje de validación acorde                                                        | 400 Bad Request           |
| Error de conexión a DB                                       | Mensaje: "Error interno, reintente más tarde"                                       | 500 Internal Server Error |


## Plan de Implementación

1. Agregar `deleted_at` al modelo `Sport` en Prisma y migración; definir índice/constraint único de `name` solo para filas activas si aplica.
2. Ajustar consultas de listado y alta para filtrar `deleted_at IS NULL` (y validar nombre único solo entre activos).
3. Implementar `softDelete` en `SportRepository` / `PostgresSportRepository` (actualización de `deleted_at`, no `delete` de fila).
4. Implementar `DeleteSportUseCase` y endpoint `DELETE /api/v1/sports/:id` en `SportController`.
5. En el frontend, método que llame al DELETE y refresque el listado ocultando el ítem dado de baja.

