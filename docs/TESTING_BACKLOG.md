# Testing Backlog

## Modulo disciplines

Fecha: 2026-05-15

Los tests del modulo `disciplines` fueron retirados del flujo activo para mantener esta rama alineada con la disciplina CRUD acordada por el equipo.

Cuando el equipo habilite nuevamente tests para este modulo, se deberia reponer cobertura equivalente a:

- Casos de uso de API: crear, obtener por id, listar por socio, obtener estado disciplinario del socio, actualizar y eliminar sanciones.
- Controller/API: respuestas exitosas y errores para `POST /api/v1/disciplines`, `GET /api/v1/disciplines/:id`, `GET /api/v1/members/:memberId/disciplines`, `GET /api/v1/members/:memberId/discipline-status`, `PUT /api/v1/disciplines/:id` y `DELETE /api/v1/disciplines/:id`.
- Validador de dominio: campos requeridos, motivo, fechas validas y consistentes, UUID de sancion y `isTotalSuspension`.
- Vista web `DisciplinesView`: estado vacio, busqueda de socios, historial de sanciones, suspension total activa, alta, errores del backend, eliminacion con confirmacion y edicion.

Archivos activos removidos:

- `packages/api/src/application/DeleteDisciplineUseCase.test.ts`
- `packages/api/src/application/GetDisciplineUseCase.test.ts`
- `packages/api/src/application/GetMemberDisciplineStatusUseCase.test.ts`
- `packages/api/src/application/ListMemberDisciplinesUseCase.test.ts`
- `packages/api/src/application/NewDisciplineUseCase.test.ts`
- `packages/api/src/application/UpdateDisciplineUseCase.test.ts`
- `packages/api/src/delivery/DisciplineController.integration.test.ts`
- `packages/api/src/delivery/DisciplineController.test.ts`
- `packages/api/src/domain/services/DisciplineValidator.test.ts`
- `packages/web/src/views/Disciplines.test.tsx`

El contenido exacto puede recuperarse desde el historial de Git si se decide reintroducir estos tests.
