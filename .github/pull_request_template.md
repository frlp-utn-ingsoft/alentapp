## Descripción

### Contexto
<!-- ¿Qué problema resuelve este PR? -->
- Ej: No existía ABM de deportes en el panel administrativo.

### Solución implementada
<!-- ¿Qué hiciste concretamente? -->
- Ej: Se agregó endpoint `POST /sports`, formulario React y validaciones.

### Referencia
<!-- Ej: TDD-0004 / Issue #23 -->
- Ej: TDD-0004 / Issue #52

---

## Cambios principales

<!-- Resumen rápido para reviewers -->

- Ej: Alta de deportes desde panel admin.
- Ej: Validación de nombre único.
- Ej: Integración frontend con backend.

---

## Decisiones técnicas relevantes

<!-- Solo si aplica: arquitectura, tradeoffs, decisiones importantes -->

- Ej: Se implementó `CreateSportUseCase` respetando arquitectura hexagonal.

---

## Testing

### Automatizado

- [ ] `npm run test`
- [ ] `npm run e2e`
- [ ] `npm run e2e:fullstack:run`

### Manual

<!-- Pasos para validar -->

1. Levantar proyecto con Docker.
2. Ir a `/sports`.
3. Crear un deporte nuevo.

### Resultado esperado

- Ej: El deporte se crea y aparece en la grilla.

---

## Requiere acciones adicionales

- [ ] Actualizar `.env`
- [ ] Ejecutar migraciones Prisma
- [ ] Rebuild Docker
- [ ] Seed de datos
- [ ] Ninguna

### Detalle (si aplica)

- Ej: Ejecutar `npx prisma migrate dev`

---

## Dependencias

- [ ] No agrega dependencias
- [ ] Sí agrega dependencias

### Ejemplo

- Frontend: `react-hook-form`
- Backend: ninguna

---

## Impacto técnico

- [ ] Cambia Base de Datos (`schema.prisma`)
- [ ] Cambia contratos compartidos (`@alentapp/shared`)
- [ ] Agrega/modifica endpoint API
- [ ] Cambia frontend UI
- [ ] Integra servicio externo
- [ ] Sin impacto relevante

---

## Evidencia visual (opcional)

<!-- Screenshots / GIF / Video -->

- Ej: Captura del formulario funcionando.

---

## ⚠️ Riesgos / Consideraciones

<!-- Qué debería mirar el reviewer -->

- Ej: Validar que no se rompa listado existente.
- Ej: Revisar migración en entornos compartidos.

---

## ✅ Checklist final

- [ ] Tests pasando localmente
- [ ] Código revisado por mí
- [ ] Sin logs/debug innecesarios
- [ ] Documentación actualizada
- [ ] Rama correctamente nombrada
- [ ] PR lista para revisión