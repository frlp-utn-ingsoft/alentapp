---
id: 0009
estado: Propuesto
autor: Nahuel Fabian Fredes Coronilla
fecha: 2026-05-03
titulo: Eliminación de lockers existentes
---

# TDD-0009: Eliminación de lockers existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja permanentemente a un locker del sistema.

### User Persona

- Nombre: Luis (Administrativo).
- Necesidad: Borrar un locker que fue cargado por error, prueba o que fue quitado físicamente del club, de forma rápida desde la misma tabla principal.

### Criterios de Aceptación

- Como Administrativo quiero poder eliminar el locker. Necesito una advertencia antes de borrar para no cometer equivocaciones irreparables.

### Escenario de Exito

- Si el usuario confirma la eliminación del locker elegido, entonces el sistema lo elimina de la base de datos e informa al usuario con un mensaje de éxito y actualiza la tabla automáticamente.

### Escenario de Fallo
 - Si el usuario desea eliminar un locker que tiene `member_id` asignado, entonces el sistema debe rechazar la operación y devolver un mensaje de error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/lockers/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `LockerRepository` (Método `delete(id)`).
2. **Caso de Uso**: `DeleteLockerUseCase` (Comprueba existencia previa vía `findById` y delega la eliminación).
3. **Adaptador de Salida**: `PostgresLockerRepository` (Eliminación usando el método `delete` de Prisma).
4. **Adaptador de Entrada**: `LockerController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                               | Código HTTP               |
| -------------------------- | ---------------------------------------------------------------- | ------------------------- |
| Locker tiene `member_id`   | Mensaje: "No se puede eliminar un locker con member asignado"    | 422 Unprocessable Entity  | 
| Locker inexistente         | Mensaje: "El locker no existe"                                   | 404 Not Found             |
| Error de conexión a DB     | Mensaje: error del motor de base de datos                        | 500 Internal Server Error |
| Eliminación exitosa        | Respuesta vacía                                                  | 204 No Content            |

## Plan de Implementación

1. Ampliar el `LockerRepository` y `PostgresLockerRepository` con el método `delete`.
2. Crear la lógica de negocio en `DeleteLockerUseCase`.
3. Crear el endpoint `DELETE /api/v1/locker/:id` en el `LockerController` y registrarlo en `app.ts`.
4. Añadir el método `delete` al servicio Frontend (`locker.ts`).
5. Enlazar el botón de eliminación en `LockersView.tsx` agregando la confirmación del navegador (`window.confirm`) antes de hacer la llamada.
