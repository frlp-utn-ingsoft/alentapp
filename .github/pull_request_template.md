## Descripción

### Contexto
<!-- ¿Qué problema resuelve este PR? -->
-

### Solución implementada
<!-- ¿Qué hiciste concretamente? -->
-

### Issue relacionado

<!-- Todo PR debe estar asociado a un issue. Sin issue no se mergea. -->
Closes #

---

## Tipo de cambio

- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `docs` — cambio en documentación
- [ ] `chore` — tarea de configuración o mantenimiento
- [ ] `refactor` — refactorización sin cambio de comportamiento

---

## Entidad afectada

<!-- ¿A qué entidad o parte del proyecto afecta este PR?
     Ejemplo: Payment · MedicalCertificate · Locker · Sport · Discipline · EquipmentLoan · General -->

---

## Cambios principales

<!-- Resumen rápido para reviewers -->
-

---

## Decisiones técnicas relevantes

<!-- Solo si aplica: arquitectura, tradeoffs, decisiones importantes -->
<!-- Ej: Se implementó CreateSportUseCase respetando arquitectura hexagonal -->
-

---

## Impacto técnico

- [ ] Cambia Base de Datos (`schema.prisma`)
- [ ] Cambia contratos compartidos (`@alentapp/shared`)
- [ ] Agrega/modifica endpoint API
- [ ] Cambia frontend UI
- [ ] Integra servicio externo
- [ ] Sin impacto relevante

## ⚠️ Breaking changes

- [ ] Este PR **no** introduce breaking changes
- [ ] Este PR **sí** introduce breaking changes

<!-- Si hay breaking changes, describí qué se rompe y para quién -->

---

## Testing

### Automatizado

- [ ] `npm run test`
- [ ] `npm run e2e`
- [ ] `npm run e2e:fullstack:run`

### Manual

<!-- Pasos para validar localmente -->
1.
2.
3.

### Resultado esperado

-

---

## Evidencia visual

<!-- Obligatorio si el cambio afecta UI — Screenshots / GIF / Video -->
<!-- Si no aplica, escribí "No aplica" -->

---

## Requiere acciones adicionales

- [ ] Actualizar `.env`
- [ ] Ejecutar migraciones Prisma (`npx prisma migrate dev`)
- [ ] Rebuild Docker
- [ ] Seed de datos
- [ ] Ninguna

---

## Dependencias

- [ ] No agrega dependencias
- [ ] Sí agrega dependencias — detallá cuáles:
  - Frontend:
  - Backend:

---

## ⚠️ Riesgos / Consideraciones para el reviewer

<!-- ¿Qué debería mirar con especial atención? -->
-

---

## Checklist del autor

- [ ] El PR tiene un issue asociado con `Closes #XX`
- [ ] Mi rama parte de `main` actualizado
- [ ] Los commits siguen el formato `tipo(scope): descripción` definido en `CONTRIBUTING.md`
- [ ] El título del PR sigue la convención de commits
- [ ] No incluí archivos innecesarios (`.env`, `node_modules`, archivos del editor, etc.)
- [ ] Se eliminaron `console.log` y comentarios de debug
- [ ] Tests pasando localmente
- [ ] Documentación actualizada si era necesario
- [ ] PR lista para revisión

---

## Checklist del reviewer

- [ ] Leí el código completo, no solo el diff
- [ ] Los commits son atómicos y descriptivos
- [ ] No hay archivos innecesarios incluidos
- [ ] El comportamiento manual fue validado
- [ ] Dejé al menos un comentario constructivo

---

## ✅ Definición de listo para mergear

Un PR está listo para mergear **únicamente** cuando se cumplen **todas** las condiciones:

1. **Issue asociado** con `Closes #XX` en la descripción
2. **2 approvals** de miembros del equipo (excluyendo el autor)
3. Tests ejecutados y pasando localmente (`npm run test`, `npm run e2e`)
4. Todos los checkboxes del autor completados
5. Ningún comentario de review sin resolver
6. Rama actualizada con `main` antes del merge
