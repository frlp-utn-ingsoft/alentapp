---
id: 0014
estado: Propuesto
autor: Luca Giordani
fecha: 2026-05-01
titulo: Desactivación de Sanción Disciplinaria
---

# TDD-0014: Desactivación de Sanción Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos desactivar sanciones registradas por error, preservando el historial disciplinario de los socios.

### User Persona

* Nombre: Alberto (Administrativo Deportivo).
* Necesidad: Desactivar una sanción mal cargada desde la tabla de sanciones de forma rápida, asegurándose de no cometer errores mediante una confirmación previa.

### Criterios de Aceptación

* El sistema debe pedir una confirmación explícita antes de proceder con la eliminación.
* El sistema debe validar que la sanción exista antes de eliminarla.
* El sistema debe realizar una eliminación lógica de la sanción preservando el historial disciplinario.
* Si la operación se realiza correctamente, la interfaz deberá reflejar el cambio en la visualización de sanciones.


## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

* Endpoint: `DELETE /api/v1/disciplines/:id`
* Request Body: `None`
* Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `IDisciplineRepository` (Método `softDelete(id)`).
2. **Caso de Uso**: `DeleteDisciplineUseCase` (Valida la existencia previa mediante `findById` y marca la sanción como eliminada lógicamente mediante `deletedAt`.).
3. **Adaptador de Salida**: `PostgresDisciplineRepository` (Actualización lógica de la entidad marcando `deletedAt`).
4. **Adaptador de Entrada**: `DisciplineController` (Extrae el `id` de la request y devuelve status 204).

## Casos de Borde y Errores

| Escenario            | Resultado Esperado                             | Código HTTP               |
| -------------------- | -----------------------------------------------| --------------------------|
| Sanción ya eliminada | Mensaje: "La sanción ya fue eliminada"         | 409 Conflict              |
| Sanción inexistente  | Mensaje: "La sanción no existe"                | 404 Not Found             |
| Error de conexión DB | Mensaje: "Error interno, reintente más tarde"  | 500 Internal Server Error |
| Eliminación exitosa  | Respuesta vacía                                | 204 No Content            |

## Plan de Implementación

1. Ampliar `IDisciplineRepository` con el método `softDelete`.
2. Implementar `DeleteDisciplineUseCase`.
3. Crear endpoint `DELETE /api/v1/disciplines/:id` en `DisciplineController`.
4. Añadir método `delete` en el servicio frontend.
