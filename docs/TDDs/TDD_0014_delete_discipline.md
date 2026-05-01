---

id: 0014
estado: Propuesto
autor: Luca Giordani
fecha: 2026-05-01
titulo: Eliminación de Sanción Disciplinaria
--------------------------------------------

# TDD-0014: Eliminación de Sanción Disciplinaria

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos eliminar sanciones registradas por error, manteniendo el sistema actualizado y evitando inconsistencias en el historial disciplinario.

### User Persona

* Nombre: Alberto (Administrativo Deportivo).
* Necesidad: Eliminar una sanción mal cargada desde la tabla de sanciones de forma rápida, asegurándose de no cometer errores mediante una confirmación previa.

### Criterios de Aceptación

* El sistema debe pedir una confirmación explícita antes de proceder con la eliminación.
* El sistema debe validar que la sanción exista antes de eliminarla.
* El sistema debe realizar un borrado físico de la base de datos (hard delete).
* Si la eliminación es exitosa, la lista de sanciones debe actualizarse automáticamente.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

* Endpoint: `DELETE /api/v1/disciplines/:id`
* Request Body: `None`
* Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `DisciplineRepository` (Método `delete(id)`).
2. **Caso de Uso**: `DeleteDisciplineUseCase` (Valida existencia previa mediante `findById` y ejecuta la eliminación).
3. **Adaptador de Salida**: `PostgresDisciplineRepository` (Eliminación en base de datos).
4. **Adaptador de Entrada**: `DisciplineController` (Extrae el `id` de la request y devuelve status 204).

## Casos de Borde y Errores

| Escenario            | Resultado Esperado              | Código HTTP     |
| -------------------- | ------------------------------- | --------------- |
| Sanción inexistente  | Mensaje: "La sanción no existe" | 400 Bad Request |
| Error de conexión DB | Mensaje: error del motor de BD  | 400 Bad Request |
| Eliminación exitosa  | Respuesta vacía                 | 204 No Content  |

## Plan de Implementación

1. Ampliar `DisciplineRepository` con el método `delete`.
2. Implementar `DeleteDisciplineUseCase`.
3. Crear endpoint `DELETE /api/v1/disciplines/:id` en `DisciplineController`.
4. Añadir método `delete` en el servicio frontend.
5. Implementar confirmación (`window.confirm`) antes de eliminar.
