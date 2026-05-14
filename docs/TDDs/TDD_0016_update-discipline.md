---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Actualización de Disciplina
---

# TDD-0016: Actualización de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo modifique los datos de una sanción existente, garantizando que la validación de fechas se mantenga: `end_date` debe seguir siendo estrictamente posterior a `start_date` tras la edición.

### User Persona

- **Nombre**: administrativo
- **Necesidad**: Corregir errores en sanciones ya cargadas (motivo, fechas, tipo de suspensión) sin tener que eliminar y volver a crear el registro.

### Criterios de Aceptación

- El sistema debe validar que `end_date` sea estrictamente posterior a `start_date` luego de la actualización.
- El sistema debe retornar el registro actualizado.
- Si la disciplina no existe, el sistema debe retornar un error claro.
- Solo se actualizan los campos enviados (actualización parcial).

## Diseño Técnico (RFC)

### Modelo de Datos

No se requieren cambios en el modelo. Se utiliza la entidad `Discipline` definida en TDD-0016.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `PATCH /api/v1/disciplines/:id`
- **Request Body**:

```ts
export interface UpdateDisciplineRequest {
    reason?: string;
    start_date?: string; // ISO DateTime string
    end_date?: string;   // ISO DateTime string, debe ser > start_date
    is_total_suspension?: boolean;
}
```

- **Response Body**: `DisciplineDTO` (definido en TDD-0016).

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Discipline`, interfaz `DisciplineRepository`, regla de negocio que valida `end_date > start_date`.
- **Application**: Caso de uso `UpdateDiscipline` que busca el registro, aplica los cambios parciales, valida fechas resultantes y persiste.
- **Infrastructure**: `DisciplineRepositoryPrisma`, `DisciplineController` con ruta HTTP PATCH.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `id` de disciplina inexistente | Mensaje: "La disciplina no existe" | 404 Not Found |
| `end_date` resultante <= `start_date` | Mensaje: "La fecha de fin debe ser posterior a la fecha de inicio" | 400 Bad Request |
| Body vacío (sin campos) | Se retorna el registro sin cambios | 200 OK |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Definir `UpdateDisciplineRequest` en `@alentapp/shared`.
2. Implementar caso de uso `UpdateDiscipline` con validación de fechas resultantes.
3. Agregar método `update` a `DisciplineRepository` e implementar en `DisciplineRepositoryPrisma`.
4. Agregar ruta `PATCH /api/v1/disciplines/:id` en `DisciplineController`.
