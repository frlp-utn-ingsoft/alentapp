---
id: 15
estado: Propuesto
autor: Maximo Carpignano
fecha: 2026-04-30
titulo: Eliminación de Deportes Existentes
---

# TDD-0015: Eliminación de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos eliminar permanentemente un deporte del sistema cuando este deja de ser ofrecido por el club, manteniendo el catálogo de actividades limpio y actualizado.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Dar de baja un deporte que fue cargado por error o que el club dejó de ofrecer. Necesita una advertencia antes de confirmar el borrado para evitar eliminaciones accidentales, ya que la operación es irreversible.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita (advertencia visual) antes de proceder con el borrado.
- El sistema debe validar que el deporte exista antes de intentar eliminarlo.
- El sistema debe validar que el deporte no haya sido dado de baja previamente (`deleted_at` debe estar en `null`).
- Al dar de baja el deporte, el sistema debe establecer `deleted_at` con la fecha y hora actuales del servidor.
- El registro de `Sport` permanece en la base de datos.
- No se eliminan los `Enrollment` asociados; se conservan como historial.
- El deporte dado de baja no debe aparecer en los listados activos ni estar disponible para nuevas inscripciones.
- Si el borrado es exitoso, la tabla del panel de administración debe actualizarse automáticamente.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere el identificador del recurso, no se envía cuerpo en la petición HTTP.
No se requieren tipos nuevos en el paquete compartido. Se reutiliza SportDTO, definido en el TDD de alta de deporte, que incluye el campo deleted_at.

- **Endpoint**: `DELETE /api/v1/sports/:id`
- **Request Body**: `None`

- **Response exitosa (`200 OK`):**

```ts
{
    data: SportDTO;
}
```

> Se devuelve `200 OK` con el DTO actualizado, en lugar de `204 No Content`, porque la baja lógica actualiza el recurso estableciendo `deleted_at`.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` con métodos `findById(id)` y `softDelete(id)`. Permite verificar existencia y marcar el deporte como eliminado lógicamente sin depender de Prisma.
2. **Servicio de Dominio / Entidad**: `Sport` o `SportValidator`, encargado de validar que el deporte exista y que no tenga `deleted_at` informado antes de permitir la baja.
3. **Caso de Uso**: `DeleteSportUseCase`, que recibe el `id`, verifica existencia, valida que no esté eliminado previamente y delega el soft delete al repositorio.
4. **Adaptador de Salida**: `PostgresSportRepository`, que implementa `softDelete` usando Prisma mediante una actualización de `deleted_at = now()` y retorna el `SportDTO` actualizado.
5. **Adaptador de Entrada**: `SportController`, ruta `DELETE /api/v1/sports/:id`, extrae el `id`, invoca el caso de uso y responde `200 OK` con `{ data: SportDTO }`.

## Casos de Borde y Errores

| Escenario              | Resultado Esperado                        | Código HTTP actual        |
| ---------------------- | ----------------------------------------- | ------------------------- |
| Deporte inexistente    | Mensaje: "El deporte no existe"           | 404 Not Found             |
| Eliminación exitosa    | Respuesta vacía                           | 204 No Content            |
| Error de conexión a DB | Mensaje: error del motor de base de datos | 500 Internal Server Error |

## Plan de Implementación

1. Confirmar que el modelo `Sport` incluya el campo `deleted_at` nullable, definido desde el TDD de alta.
2. Confirmar que `SportDTO` incluya `deleted_at: string | null`.
3. Agregar al puerto `SportRepository` el método `softDelete(id): Promise<SportDTO>` y asegurar que exista `findById(id)`.
4. Implementar `DeleteSportUseCase`, validando existencia del deporte y que `deleted_at` esté en `null`.
5. Implementar `softDelete` en `PostgresSportRepository` usando Prisma, actualizando `deleted_at` con la fecha actual del servidor.
6. Implementar el endpoint `DELETE /api/v1/sports/:id` en `SportController` y registrarlo en Fastify.
7. Añadir el método `delete` o `softDelete` al servicio frontend.
8. Enlazar el botón de baja en la vista de deportes, agregando confirmación visual antes de ejecutar la operación.
9. Asegurar que los listados y búsquedas operativas de deportes excluyan registros con `deleted_at` distinto de `null`.
10. Escribir tests unitarios para el caso de uso: deporte inexistente, deporte ya eliminado y baja lógica exitosa.
11. Escribir tests de integración para el endpoint `DELETE /api/v1/sports/:id`.
