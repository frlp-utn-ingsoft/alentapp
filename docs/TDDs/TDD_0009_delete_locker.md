---
id: 0003
estado: pendiente
autor: Cesar Huari
fecha: 2026-05-01
titulo: Eliminación de locker Existentes
---

# TDD-0003: Eliminación de locker Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja permanentemente a un locker del sistema, eliminando su registro de la base de datos para mantener la lista actualizada y libre de registros duplicados o cancelados erróneamente.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Borrar un locker que fue cargado por error o un usuario de prueba, de forma rápida desde la misma tabla principal. Necesita una advertencia antes de borrar para no cometer equivocaciones irreparables.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita (advertencia visual) antes de proceder con el borrado.
- El sistema debe validar que el locker exista antes de intentar borrarlo.
- El sistema debe realizar un borrado físico de la base de datos (hard delete).
- El sistema no debera permitir borrar un locker con una reserva pendiente.
- Si el borrado es exitoso, la tabla debe actualizarse automáticamente.

## Diseño Técnico (RFC)
 La entidad `locker` se relacinoa con `Enrollment`, por lo que antes de elimnar un locker debe validarse que no exita una reserva asociada
 -`Locker.id`:identificador del locker a eliminar.
 -`Enrollment.locker_id`:Clave foranea que refencia al locker.

Regla de eliminacion:
-Si existen registros en `Enrollment` asociados a `locker`, no se permite el borrado.
-Si no existe una reserva asociada, se permite el hard delete.

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/locker/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Domain**: Regla de negocio que impide eliminar un locker con reserva asociada.
2. **Application**: Caso de uso `DeleteLockerUseCase`, encargado de validar existencia y consultar si existe reserva vinculada.
3. **Puerto**: `LockerRepository`, con métodos `findById(id)` y `delete(id)`.
4. **Puerto adicional**: `EnrollmentRepository`, con método `existsByLockerId(lockerId)`.
5. **Infrastructure**: `PostgresLockerRepository` y `PostgresEnrollmentRepository`.
6. **Adaptador de Entrada**: `LockerController`, encargado de recibir el `id` y devolver el código HTTP correspondiente.
7. **Frontend**: Botón de eliminación con confirmación previa y actualización automática de la tabla.

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                               | Código HTTP actual        |
| -------------------------- | -------------------------------------------------| ------------------------- |
| Locker inexistente         | Mensaje: "El locker no existe"                   | 400 Bad Request           |
| Locker con reserva sociada | Mensaje: `No se puede eliminar locker con reserva| 409 Conflict              |
| Error de conexión a DB     | Mensaje: error del motor de base de datos        | 400 Bad Request           |
| Eliminación exitosa        | Respuesta vacía                                  | 204 No Content            |

## Plan de Implementación

1. Ampliar el `LockerRepository` con los métodos `findById` y `delete`.
2. Crear o ampliar el `EnrollmentRepository` con el método `existsByLockerId`.
3. Implementar `DeleteLockerUseCase`, validando existencia del locker  y reserva asociada.
4. Crear el endpoint `DELETE /api/v1/locker/:id` en `LockerController`.
5. Implementar el método `delete` en el servicio frontend de locker.
6. Enlazar el botón de eliminación en la vista de deportes agregando confirmación previa.
7. Actualizar automáticamente la tabla luego de una eliminación exitosa.
