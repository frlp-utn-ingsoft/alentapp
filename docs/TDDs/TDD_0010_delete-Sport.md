---
id: 0010
autor: Tomás Bellizzi
estado: Implementado
fecha: 2026-05-01
titulo: Baja de Deporte Existente (Sport)
---

# TDD-0010: Baja de Deporte Existente 

## Contexto de Negocio (PRD)

### Objetivo
Permitir al personal administrativo eliminar un deporte del catálogo del club cuando este deja de ofrecerse, asegurando la integridad referencial con las inscripciones y disciplinas asociadas.

### User Persona
- **Nombre**: Administrador del Club
- **Necesidad**: Necesita poder eliminar deportes que ya no se ofrecen en el club, para mantener el catálogo limpio y actualizado. Su punto de dolor es tener deportes obsoletos que confunden a los socios al momento de inscribirse.

### Criterios de Aceptación
- El sistema debe eliminar el deporte identificado por su `id`.
- Si el deporte no existe, el sistema debe retornar un error claro.
- El sistema debe verificar que no existan inscripciones (`Enrollment`) activas asociadas al deporte antes de eliminarlo, para preservar la integridad de los datos.
- La operación debe retornar una confirmación de eliminación exitosa.

## Diseño Técnico (RFC)

### Modelo de Datos
Sin cambios en el schema. La operación es un borrado físico (`DELETE`) del registro `Sport` identificado por su `id`, siempre que no tenga relaciones activas que lo impidan.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/sports/:id`
- **Request Body**: None
- **Response Body**: 204 No content (en caso de exito)

### Componentes de Arquitectura Hexagonal

- **Domain**: Regla de negocio: un `Sport` no puede eliminarse si tiene `Enrollment` activos asociados (campo `is_active: true` en `Enrollment`).
- **Application**: Caso de Uso `DeleteSportUseCase`. Puertos de salida: `ISportRepository` con métodos `findById(id: string): Promise<Sport | null>` y `delete(id: string): Promise<void>`; `IEnrollmentRepository` con método `hasActiveEnrollmentsBySport(sportId: string): Promise<boolean>`.
- **Infrastructure**: Controlador Fastify `SportController` (ruta DELETE). Implementación en `PrismaSportRepository` y `PrismaEnrollmentRepository`.

## Casos de Borde y Errores

| Escenario                                  | Resultado Esperado                                                      | Código HTTP       |
|--------------------------------------------|-------------------------------------------------------------------------|-------------------|
| `id` no corresponde a ningún deporte       | Error con mensaje "Deporte no encontrado"                               | 404 Not Found     |
| Deporte con inscripciones activas          | Error con mensaje "No se puede eliminar: existen inscripciones activas" | 409 Conflict      |
| `id` con formato inválido (no UUID)        | Error de validación de parámetro                                        | 400 Bad Request   |
| Eliminación exitosa                        | Mensaje de confirmación y registro removido de la base de datos         | 204 No Content    |

## Plan de Implementación
1. Añadir método `delete(id: string): Promise<void>` al puerto `ISportRepository` en `@alentapp/shared`.
2. Añadir método `hasActiveEnrollmentsBySport` al puerto `IEnrollmentRepository`.
3. Implementar `DeleteSportUseCase` en Application (buscar deporte, verificar inscripciones activas, eliminar).
4. Implementar los métodos de borrado en `PrismaSportRepository` y `PrismaEnrollmentRepository`.
5. Implementar la ruta `DELETE /api/v1/sports/:id` en el controlador Fastify.
6. Escribir tests unitarios para el caso de uso (deporte inexistente, con inscripciones, sin inscripciones).
7. Escribir tests de integración para el endpoint.
