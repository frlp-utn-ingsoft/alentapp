---
id: 0015
estado: Aprobado
autor: Luciana Martino
fecha: 2026-05-03
titulo: Eliminación de Disciplina
---

# TDD-0021: Eliminación de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos eliminar una disciplina o sanción registrada por error, manteniendo actualizado el historial disciplinario de los socios.

A diferencia de entidades con reglas de baja lógica obligatoria, para `Discipline` el enunciado no impone una restricción de inmutabilidad. Por lo tanto, se permite implementar una eliminación física siempre que la disciplina exista y el usuario confirme la operación.

### User Persona

*   **Nombre**: Alberto
*   **Rol**: Administrativo del club
*   **Necesidad**: Eliminar una sanción disciplinaria cargada por error, evitando que quede asociada incorrectamente al historial de un socio.

### Criterios de Aceptación

*   El sistema debe permitir eliminar una disciplina existente.
*   El sistema debe validar que la disciplina exista antes de eliminarla.
*   El sistema debe pedir confirmación explícita antes de realizar la eliminación.
*   Si la eliminación es exitosa, debe retornar una respuesta sin contenido.
*   Si la eliminación es exitosa, el listado de disciplinas debe actualizarse.

## Diseño Técnico (RFC)

### Modelo de Datos

La baja operará sobre la entidad `Discipline` existente:

*   `id`: UUID. Identificador único de la disciplina.
*   `member_id`: UUID. Socio asociado a la disciplina.
*   `reason`: String. Motivo de la sanción.
*   `start_date`: DateTime. Fecha de inicio.
*   `end_date`: DateTime. Fecha de fin.
*   `is_total_suspension`: Boolean. Tipo de suspensión.

Regla de baja:

*   Solo se puede eliminar una disciplina existente.
*   La eliminación puede ser física, ya que la regla del TP para esta entidad se enfoca en la validación de fechas.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `DELETE /api/v1/disciplines/:id`
*   **Request Body**: `None`

*   **Response esperada**: `204 No Content`

```ts
// No retorna body en caso de eliminación exitosa.
```

## Componentes de Arquitectura Hexagonal
1. **Domain**:
    - Entidad Discipline.
    - Regla de negocio: solo se elimina una disciplina existente.
    - No se aplican validaciones de fechas durante la eliminación, porque no se modifican fechas.
2. **Application**:
    - Puerto DisciplineRepository.
    - Caso de uso DeleteDisciplineUseCase.
    - Validación de existencia mediante findById.
    - Delegación de eliminación al repositorio.
3. **Infrastructure**:
    - Adaptador de salida PostgresDisciplineRepository.
    - Método delete(id).
    - Controlador DisciplineController.
    - Ruta DELETE /api/v1/disciplines/:id.
    - Confirmación visual en frontend.

## Casos de Borde y Errores

| Escenario              | Resultado Esperado                            | Código HTTP               |
| ---------------------- | --------------------------------------------- | ------------------------- |
| Disciplina inexistente | Mensaje: "La disciplina no existe"            | 404 Not Found             |
| Eliminación exitosa    | Respuesta vacía                               | 204 No Content            |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación
1. Ampliar DisciplineRepository con el método delete(id).
2. Implementar delete(id) en PostgresDisciplineRepository.
3. Crear DeleteDisciplineUseCase.
4. Validar existencia de la disciplina mediante findById.
5. Delegar la eliminación al repositorio.
6. Crear el endpoint DELETE /api/v1/disciplines/:id.
7. Agregar confirmación visual en frontend antes de eliminar.
8. Actualizar el listado de disciplinas luego de una eliminación exitosa.
9. Agregar tests de eliminación exitosa, disciplina inexistente y error de persistencia.