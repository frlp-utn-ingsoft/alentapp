---
id: 0009
estado: Propuesto
autor: Tomás Bellizzi
fecha: 2026-05-01
titulo: Modificación de Deportes Existentes (Sport)
---

# TDD-0009: Modificación de Deportes Existentes

## Contexto de Negocio (PRD)

### Objetivo
Permitir al personal administrativo actualizar los datos editables de un deporte ya registrado (descripción y capacidad máxima), respetando la inmutabilidad del nombre.

### User Persona
- **Nombre**: Administrador del Club
- **Necesidad**: Necesita poder ajustar la capacidad máxima de un deporte según disponibilidad de espacios, o actualizar la descripción para comunicar mejor la actividad a los socios. Su punto de dolor es no poder corregir información sin tener que eliminar y volver a crear el deporte.

### Criterios de Aceptación
- El sistema debe permitir modificar únicamente los campos `description`, `max_capacity` y `additional_price`, y `requires_medical_certificate`.
- El sistema **no debe permitir** modificar el campo `name`. Si se incluye en el body, debe ser ignorado o rechazado con un error explícito.
- El sistema debe validar que `max_capacity`, si se incluye, siga siendo mayor a cero.
- El sistema debe validar que`additional_price`, si se informa, sea mayor o igual a cero.
- Si el deporte no existe, el sistema debe retornar un error claro.
- El sistema debe retornar el recurso actualizado completo.

## Diseño Técnico (RFC)

### Modelo de Datos
Sin cambios en el schema. La operación es un `UPDATE` parcial sobre el registro `Sport`.

Campos editables:
- `description`: String, opcional.
- `max_capacity`: Int, debe ser > 0.
- `additional_price`: Float, opcional.
- `requires_medical_certificate`: Boolean.

Campo **inmutable** (no editable post-creación):
- `name`: String.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `PATCH /api/v1/sports/:id`
- **Request Body** (UpdateSportRequest):
```ts
{
  description?: string;
  max_capacity?: number;       // Entero > 0 si se especifica
  additional_price?: number;   // >= 0 si se especifica
  requires_medical_certificate?: boolean;
}
```
- **Response Body** (200 OK):
```ts
{
  id: string;
  name: string;
  description: string | null;
  max_capacity: number;
  additional_price: number | null;
  requires_medical_certificate: boolean;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**:
  - Entidad `Sport` con método `update(data: UpdateSportData)` que sólo aplica los campos permitidos.
  - La inmutabilidad de `name` se garantiza en el dominio: el método `update` no expone ese campo.
- **Application**:
  - Caso de Uso `UpdateSportUseCase`.
  - Puerto de salida `ISportRepository` con métodos `update(id: string, data: UpdateSportData): Promise<Sport>` y `findById(id: string): Promise<Sport | null>`.
  - DTOs en Shared: `UpdateSportRequest` y `SportResponse`.
- **Infrastructure**:
  - `SportController`: recibe el request HTTP y lo delega al caso de uso.
  - `SportRouter`: registra la ruta `PATCH /api/v1/sports/:id` y la conecta al controlador.
  - `PrismaSportRepository`: implementación del puerto `ISportRepository`.
  - `SportPersistenceMapper`: convierte entre la entidad de dominio `Sport` y el modelo de Prisma (`toPersistence`, `toDomain`).
  - `SportDTOMapper`: convierte la entidad de dominio a `SportResponse` (`toDTO`).

## Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                      | Código HTTP       |
|-----------------------------------------|---------------------------------------------------------------|-------------------|
| `id` no corresponde a ningún deporte    | Mensaje: "Deporte no encontrado"                              | 404 Not Found     |
| Se intenta modificar `name`             | Mensaje: "El nombre del deporte no puede modificarse"         | 400 Bad Request   |
| `max_capacity` es 0 o negativo          | Mensaje: "La capacidad máxima debe ser mayor a cero"          | 400 Bad Request   |
| `additional_price` es negativo           | Mensaje: "El precio adicional debe ser mayor o igual a cero" | 400 Bad Request   |
| Body vacío (sin campos a actualizar)    | Mensaje: "Se requiere al menos un campo para actualizar"      | 400 Bad Request   |
| Actualización exitosa                   | Retorna el deporte con los datos actualizados                 | 200 OK            |

## Plan de Implementación
1. Definir tipos `UpdateSportRequest` y `SportResponse` en Shared (`@alentapp/shared`).
2. Implementar el método `update` en la entidad `Sport` en el Domain, excluyendo `name`.
3. Añadir métodos `findById` y `update` al puerto `ISportRepository` en Application.
4. Implementar `UpdateSportUseCase` en Application (buscar deporte, aplicar cambios, persistir).
5. Implementar `SportPersistenceMapper` con los métodos `toPersistence` y `toDomain`.
6. Implementar `SportDTOMapper` con el método `toDTO`.
7. Implementar el método `update` en `PrismaSportRepository` en Infrastructure.
8. Implementar `SportController` en Infrastructure.
9. Implementar `SportRouter` y registrarlo en la aplicación.
10. Escribir tests unitarios para el caso de uso (deporte inexistente, intento de cambiar nombre, capacidad inválida, actualización válida).
11. Escribir tests de integración para el endpoint.