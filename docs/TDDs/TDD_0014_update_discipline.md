---
id: 0014
estado: Aprobado
autor: Luciana Martino
fecha: 2026-05-03
titulo: Actualización de Disciplina
---

# TDD-0020: Actualización de Disciplina

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos modificar una sanción disciplinaria existente cuando se haya cargado un dato incorrecto o cuando cambie la duración de la sanción.

La actualización debe conservar la consistencia de las fechas, asegurando que el período final de la sanción siempre sea válido: `end_date` debe ser estrictamente posterior a `start_date`.

### User Persona

*   **Nombre**: Alberto
*   **Rol**: Administrativo del club
*   **Necesidad**: Corregir el motivo, las fechas o el tipo de suspensión de una sanción disciplinaria ya registrada, sin permitir períodos inválidos.

### Criterios de Aceptación

*   El sistema debe permitir actualizar una disciplina existente.
*   El sistema debe validar que la disciplina exista antes de modificarla.
*   El sistema debe permitir modificar `reason`, `start_date`, `end_date` e `is_total_suspension`.
*   El sistema no debe permitir modificar el `member_id` desde este caso de uso.
*   El sistema debe validar que el motivo no quede vacío.
*   El sistema debe validar que las fechas resultantes sean válidas.
*   El sistema debe validar que `end_date` sea estrictamente posterior a `start_date`, considerando los valores finales luego de aplicar la actualización.
*   Si la actualización es correcta, debe retornar los datos actualizados de la disciplina.

## Diseño Técnico (RFC)

### Modelo de Datos

La actualización operará sobre la entidad `Discipline` existente:

*   `id`: UUID. No modificable.
*   `member_id`: UUID. No modificable desde este endpoint.
*   `reason`: String. Editable, pero no puede quedar vacío.
*   `start_date`: DateTime. Editable.
*   `end_date`: DateTime. Editable, pero debe ser estrictamente posterior a `start_date`.
*   `is_total_suspension`: Boolean. Editable.
*   `updated_at`: DateTime. Se actualiza automáticamente.

Reglas de actualización:

*   No se debe modificar el `id`.
*   No se debe modificar el `member_id`.
*   Si se modifica solo una de las fechas, la validación debe hacerse contra la otra fecha ya guardada.
*   El estado final de la disciplina debe cumplir: `end_date > start_date`.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/disciplines/:id`
*   **Request Body**: `UpdateDisciplineRequest`

```ts
{
    reason?: string;
    startDate?: string;
    endDate?: string;
    isTotalSuspension?: boolean;
}
```
**Response esperada**: 200 OK

```ts
{
    id: string;
    memberId: string;
    reason: string;
    startDate: string;
    endDate: string;
    isTotalSuspension: boolean;
    createdAt: string;
    updatedAt: string;
}
```
## Componentes de Arquitectura Hexagonal

1. **Domain**:
    - Entidad Discipline.
    - Servicio DisciplineValidator.
    - Regla de negocio: end_date debe ser estrictamente posterior a start_date.
    - Validación de motivo obligatorio.
2. **Application**:
    - Puerto DisciplineRepository.
    - Caso de uso UpdateDisciplineUseCase.
    - Validación de existencia mediante findById.
    - Reconstrucción del estado final de la disciplina antes de validar fechas.
    - Rechazo explícito de campos no permitidos, como memberId.
3. **Infrastructure**:
    - Adaptador de salida PostgresDisciplineRepository.
    - Método update(id, data).
    - Controlador DisciplineController.
    - Ruta PUT /api/v1/disciplines/:id.
    - Mapeo de errores de dominio a códigos HTTP.

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                                 | Código HTTP               |
| --------------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| Disciplina inexistente                  | Mensaje: "La disciplina no existe"                                 | 404 Not Found             |
| Motivo vacío                            | Mensaje: "El motivo de la sanción es obligatorio"                  | 400 Bad Request           |
| Fecha de inicio inválida                | Mensaje: "La fecha de inicio no es válida"                         | 400 Bad Request           |
| Fecha de fin inválida                   | Mensaje: "La fecha de fin no es válida"                            | 400 Bad Request           |
| Fecha de fin igual a fecha de inicio    | Mensaje: "La fecha de fin debe ser posterior a la de inicio"       | 400 Bad Request           |
| Fecha de fin anterior a fecha de inicio | Mensaje: "La fecha de fin debe ser posterior a la de inicio"       | 400 Bad Request           |
| Intento de modificar memberId           | Mensaje: "No se puede modificar el socio asociado a la disciplina" | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"                      | 500 Internal Server Error |
| Actualización exitosa                   | Retorna la disciplina actualizada                                  | 200 OK                    |

## Plan de Implementación

1. Crear el tipo compartido UpdateDisciplineRequest.
2. Ampliar DisciplineRepository con el método update(id, data).
3. Implementar update en PostgresDisciplineRepository.
4. Reutilizar o crear DisciplineValidator.
5. Implementar UpdateDisciplineUseCase.
6. Validar existencia de la disciplina mediante findById.
7. Reconstruir los valores finales de reason, startDate, endDate e isTotalSuspension.
8. Validar que el motivo final no esté vacío.
9. Validar que endDate sea estrictamente posterior a startDate.
10. Bloquear modificación de id y member_id.
11. Crear el endpoint PUT /api/v1/disciplines/:id.
12. Consumir el endpoint desde el frontend.
13. Agregar tests para actualización exitosa, disciplina inexistente, motivo vacío, fechas inválidas e intento de modificar memberId.