---
id: 0014
estado: Propuesto
autor: Maximo Carpignano
fecha: 2026-04-30
titulo: Actualización de Deportes Existentes
---

# TDD-0014: Actualización de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos modificar la información de un deporte existente, específicamente su descripción y capacidad máxima. El nombre del deporte es un identificador natural del sistema y no puede ser modificado una vez creado, garantizando la integridad de los datos históricos y las inscripciones vigentes.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Actualizar el cupo de un deporte cuando el club habilita más espacio, o corregir la descripción de una actividad. No debe poder cambiar el nombre del deporte ya que podría generar inconsistencias con los registros de inscripción existentes.

### Criterios de Aceptación

- El sistema debe permitir actualizar únicamente `description` y `max_capacity`.
- El sistema **no debe exponer** el campo `name` como editable en ninguna parte del flujo (ni en el frontend ni en el backend).
- El sistema debe validar que `max_capacity` sea estrictamente mayor a cero si se envía en la solicitud.
- El sistema debe validar que el deporte exista antes de intentar actualizarlo.
- Si la edición es correcta, debe retornar los datos actualizados del deporte.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Solo los campos editables se incluyen en el cuerpo de la petición. `name` está explícitamente excluido del tipo de request para reforzar la inmutabilidad a nivel de contrato.

- **Endpoint**: `PUT /api/v1/sports/:id`
- **Request Body** (`UpdateSportRequest`):

```ts
{
    description?: string;
    max_capacity?: number;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `SportRepository` extendida con método `update(id, data)` y `findById(id)`. Regla de negocio: `max_capacity > 0` si se provee. El campo `name` no forma parte del tipo de actualización.
- **Application**: Caso de uso `UpdateSportUseCase`. Verifica existencia del deporte via `findById`. Valida que `max_capacity > 0` si viene en el payload. Delega persistencia al repositorio.
- **Infrastructure**: `PostgresSportRepository` (implementación del método `update` usando Prisma, que opera únicamente sobre `description` y `max_capacity`). `SportController` (ruta HTTP `PUT /api/v1/sports/:id`, extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                       | Resultado Esperado                                       | Código HTTP actual        |
| ------------------------------- | -------------------------------------------------------- | ------------------------- |
| Deporte inexistente             | Mensaje: "El deporte no existe"                          | 404 Not Found             |
| `max_capacity` igual a cero     | Mensaje: "La capacidad máxima debe ser mayor a cero"     | 400 Bad Request           |
| `max_capacity` negativo         | Mensaje: "La capacidad máxima debe ser mayor a cero"     | 400 Bad Request           |
| Body vacío (sin campos válidos) | No se realiza ningún cambio, se retorna el estado actual | 200 OK                    |
| Error de conexión a DB          | Mensaje: "Error interno, reintente más tarde"            | 500 Internal Server Error |

## Plan de Implementación

1. Actualizar las interfaces en el paquete `@alentapp/shared` agregando el tipo `UpdateSportRequest` (sin el campo `name`).
2. Ampliar la interfaz `SportRepository` en el Dominio con los métodos `update(id, data)` y `findById(id)`.
3. Implementar los métodos en `PostgresSportRepository` usando Prisma.
4. Implementar `UpdateSportUseCase` con validación de existencia y de `max_capacity > 0`.
5. Crear el endpoint `PUT /api/v1/sports/:id` en `SportController` y registrarlo en `app.ts`.
6. Reutilizar o adaptar el modal del frontend para la edición, mostrando únicamente los campos `description` y `max_capacity` (ocultando `name`).
