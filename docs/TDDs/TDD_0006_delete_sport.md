---
id: 0006
estado: Pendiente
autor: [Facundo Pierrard]
fecha: 2026-05-01
titulo: Eliminación de Deporte Existente
---

# TDD-0003: Eliminación de Deporte Existente

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo elimine un deporte que fue cargado por error o que ya no forma parte de la oferta de la institución, evitando afectar inscripciones existentes de socios.

### User Persona

- Nombre: Alberto (Tesorero/Administrativo).
- Necesidad: Eliminar deportes incorrectos o dados de baja desde la tabla de administración, pero sin romper el historial o la integridad de las inscripciones ya registradas.

### Criterios de Aceptación

- El sistema debe pedir una confirmación explícita antes de eliminar el deporte.
- El sistema debe validar que el deporte exista antes de intentar eliminarlo.
- El sistema debe impedir la eliminación si existen inscripciones asociadas al deporte.
- Si el deporte no tiene inscripciones asociadas, el sistema debe permitir el borrado físico.
- Si el borrado es exitoso, la tabla de deportes debe actualizarse automáticamente.

## Diseño Técnico (RFC)

### Modelo de Datos

La entidad `Sport` se relaciona con `Enrollment`, por lo que antes de eliminar un deporte debe validarse que no existan inscripciones asociadas.

- `Sport.id`: Identificador del deporte a eliminar.
- `Enrollment.sport_id`: Clave foránea que referencia al deporte.

Regla de eliminación:

- Si existen registros en `Enrollment` asociados al `Sport`, no se permite el borrado.
- Si no existen inscripciones asociadas, se permite el hard delete.

### Contrato de API (@alentapp/shared)

Al tratarse de una operación destructiva que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `DELETE /api/v1/deportes/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Domain**: Regla de negocio que impide eliminar un deporte con inscripciones asociadas.
2. **Application**: Caso de uso `DeleteSportUseCase`, encargado de validar existencia y consultar si hay inscripciones vinculadas.
3. **Puerto**: `SportRepository`, con métodos `findById(id)` y `delete(id)`.
4. **Puerto adicional**: `EnrollmentRepository`, con método `existsBySportId(sportId)`.
5. **Infrastructure**: `PostgresSportRepository` y `PostgresEnrollmentRepository`.
6. **Adaptador de Entrada**: `SportController`, encargado de recibir el `id` y devolver el código HTTP correspondiente.
7. **Frontend**: Botón de eliminación con confirmación previa y actualización automática de la tabla.

## Casos de Borde y Errores

| Escenario                              | Resultado Esperado                                             | Código HTTP               |
| -------------------------------------- | -------------------------------------------------------------- | ------------------------- |
| Deporte inexistente                    | Mensaje: "El deporte no existe"                                | 400 Bad Request           |
| Deporte con inscripciones asociadas    | Mensaje: "No se puede eliminar un deporte con inscripciones"    | 409 Conflict              |
| Error de conexión a DB                 | Mensaje: "Error interno, reintente más tarde"                  | 500 Internal Server Error |
| Eliminación exitosa                    | Respuesta vacía                                                | 204 No Content            |

## Plan de Implementación

1. Ampliar el `SportRepository` con los métodos `findById` y `delete`.
2. Crear o ampliar el `EnrollmentRepository` con el método `existsBySportId`.
3. Implementar `DeleteSportUseCase`, validando existencia del deporte e inscripciones asociadas.
4. Crear el endpoint `DELETE /api/v1/deportes/:id` en `SportController`.
5. Implementar el método `delete` en el servicio frontend de deportes.
6. Enlazar el botón de eliminación en la vista de deportes agregando confirmación previa.
7. Actualizar automáticamente la tabla luego de una eliminación exitosa.
