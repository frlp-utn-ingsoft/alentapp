---
id: 0023
estado: Propuesto
autor: Juan Ignacio Piazza
fecha: 2026-05-09
titulo: Actualización de Inscripciones Existentes
---

# TDD-0023: Actualización de Inscripciones Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos corregir o modificar la fecha de inscripción y/o actualizar la vigencia de una inscripción existente en el sistema, en caso que hayan cambiado o se hayan ingresado incorrectamente.

### User Persona

- Nombre: Jorge (Administrativo).
- Necesidad: Modificar datos de las inscripciones rápidamente desde la tabla del panel de administración. Por ejemplo, actualizar la fecha de inscripción o el estado de vigencia de una inscripción.

### Criterios de Aceptación

- Como administrativo quiero poder editar la fecha de inscripción y/o cambiar el estado de vigencia de una inscripción de un socio a un deporte.
- El sistema no debe permitir editar el socio asociado o deporte asociado una vez creada la inscripción.

### Escenario de Exito

- Si el usuario edita la inscripción con los datos válidos, el sistema debe actualizarlo correctamente e informar al usuario mediante un mensaje de exito.

### Escenario de Fallo

- Si el usuario ingresa una fecha posterior a la fecha actual, el sistema debe rechazar la modificación e informarlo mediante un mensaje de error.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `PUT /api/v1/enrollments/:id`
- Request Body (UpdateEnrollmentRequest):

```ts
{
    enrollment_date?: string;
    is_active?: boolean;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `EnrollmentRepository` (Método `update(id, data)`).
2. **Servicio de Dominio**: `EnrollmentValidator`
3. **Caso de Uso**: `UpdateEnrollmentUseCase` (Orquesta la validación y llama al repositorio).
4. **Adaptador de Salida**: `PostgresEnrollmentRepository` (Actualización usando el método `update` de Prisma).
5. **Adaptador de Entrada**: `EnrollmentController` (Ruta HTTP que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Inscripción inexistente        | Mensaje: "La inscripción no existe"               | 400 Bad Request           |
| `member_id` presente en el request body | Mensaje: "No se puede editar el socio asociado"    | 409 Conflict        |
| `sport_id` presente en el request body | Mensaje: "No se puede editar el deporte asociado"    | 409 Conflict        |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar las interfaces en el paquete `@alentapp/shared` (`UpdateEnrollmentRequest`).
2. Ampliar el `EnrollmentRepository` con el método `update`.
3. Implementar la lógica en `UpdateEnrollmentUseCase` utilizando el `EnrollmentValidator` centralizado.
4. Crear la ruta `PUT` en el controlador y enlazarla a la app de Fastify.
5. Consumir el endpoint desde el servicio de Frontend y reutilizar el modal de creación para permitir la edición.
