---
id: 0024
estado: Propuesto
autor: Juan Ignacio Piazza
fecha: 2026-05-09
titulo: Eliminación de Inscripciones Existentes
---

# TDD-0012: Eliminación de Inscripciones Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja permanentemente una inscripción del sistema.

### User Persona

- Nombre: Jorge (Administrativo).
- Necesidad: Borrar una inscripción que fue cargado por error o prueba, de forma rápida desde la misma tabla principal.

### Criterios de Aceptación

- Como administrativo quiero poder eliminar la inscripción de un socio a un deporte. Necesito una advertencia antes de borrar para no cometer equivocaciones irreparables.

### Escenario de Exito

- Si el usuario confirma la eliminación de una inscripción dada, el sistema debe la eliminar de la base de datos, e informar con un mensaje de exito al usuario.

### Escenario de Fallo

- Si la inscripción a eliminar no existe, el sistema debe rechazar la operación e informar al usuario con un mensaje de error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/enrollments/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EnrollmentRepository` (Método `delete(id)`).
2. **Caso de Uso**: `DeleteEnrollmentUseCase` (Comprueba existencia previa vía `findById` y delega la eliminación).
3. **Adaptador de Salida**: `PostgresEnrollmentRepository` (Eliminación usando el método `delete` de Prisma).
4. **Adaptador de Entrada**: `EnrollmentController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Inscripción inexistente          | Mensaje: "La inscripción no existe"               | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: error del motor de base de datos     | 500 Internal Server Error |
| Eliminación exitosa        | Respuesta vacía                               | 204 No Content            |

## Plan de Implementación

1. Ampliar el `EnrollmentRepository` y `PostgresEnrollmentRepository` con el método `delete`.
2. Crear la lógica de negocio en `DeleteEnrollmentUseCase`.
3. Crear el endpoint `DELETE /api/v1/enrollments/:id` en el `EnrollmentController` y registrarlo en `app.ts`.
4. Añadir el método `delete` al servicio Frontend (`enrollments.ts`).
5. Enlazar el botón de eliminación en `EnrollmentsView.tsx` agregando la confirmación del navegador (`window.confirm`) antes de hacer la llamada.
