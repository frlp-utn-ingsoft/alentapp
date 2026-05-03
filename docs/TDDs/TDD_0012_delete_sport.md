---
id: 0012
estado: Propuesto
autor: Juan Ignacio Piazza
fecha: 2026-05-03
titulo: Eliminación de Deportes Existentes
---

# TDD-0012: Eliminación de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja permanentemente un deporte del sistema, eliminando su registro y las inscripciones de los socios al mismo de la base de datos.

### User Persona

- Nombre: Jorge (Administrativo).
- Necesidad: Borrar un deporte que fue cargado por error, prueba o que dejó de ofrecerse en el club, de forma rápida desde la misma tabla principal.

### Criterios de Aceptación

- Como administrativo quiero poder eliminar un deporte y las inscripciones de los socios al mismo. Necesito una advertencia antes de borrar para no cometer equivocaciones irreparables.

### Escenario de Exito

- Si el usuario confirma la eliminación de un deporte dado, el sistema debe eliminar las inscripciones de los socios del club a dicho deporte y el deporte, de la base de datos, e informar con un mensaje de exito al usuario.

### Escenario de Fallo

- Si el deporte a eliminar no existe, el sistema debe rechazar la operación e informar al usuario con un mensaje de error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/sport/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `SportRepository` (Método `delete(id)`).
2. **Caso de Uso**: `DeleteSportUseCase` (Comprueba existencia previa vía `findById` y delega la eliminación).
3. **Adaptador de Salida**: `PostgresSportRepository` (Eliminación usando el método `delete` de Prisma).
4. **Adaptador de Entrada**: `SportController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Deporte inexistente          | Mensaje: "El deporte no existe"               | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: error del motor de base de datos     | 500 Internal Server Error |
| Eliminación exitosa        | Respuesta vacía                               | 204 No Content            |

## Plan de Implementación

1. Ampliar el `SportRepository` y `PostgresSportRepository` con el método `delete`.
2. Crear la lógica de negocio en `DeleteSportUseCase`.
3. Crear el endpoint `DELETE /api/v1/sport/:id` en el `SportController` y registrarlo en `app.ts`.
4. Añadir el método `delete` al servicio Frontend (`sports.ts`).
5. Enlazar el botón de eliminación en `SportsView.tsx` agregando la confirmación del navegador (`window.confirm`) antes de hacer la llamada.
