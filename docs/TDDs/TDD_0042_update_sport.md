---
id: "0042"
estado: Propuesto
autor: Tomas Rosato
fecha: 2026-05-03
titulo: Actualizacion de Deportes existentes
---

# TDD-0042: Actualizacion de Deportes existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos corregir o modificar la información de un deporte existente en el sistema su descripcion o capacidad maxima que hayan cambiado o se hayan ingresado incorrectamente.

### User Persona

-Nombre: Carlos (Administrativo).
-Necesidad: Modificar datos de un deporte rápidamente desde la tabla del panel de administración. Por ejemplo actualizar la capacidad maxima ya que se ampliaron las instalaciones.

### Criterios de Aceptación

- El sistema debe validar que el deporte exista antes de modificarlo.
- El sistema debe permitir actualizar uno, varios o todos los campos editables.
- El sistema no debe permitir modificar `name`.
- El sistema no debe permitir modificar `additional_price`.
- El sistema no debe permitir modificar `requires_medical_certificate`.
- El sistema debe permitir actualizar solo `description` y `max_capacity`.
- Si se modificia  `max_capacity` el sistema debe validar que `max_capacity` sea un numero entero, mayor a cero.
- Si se modifica `description`, el valor no puede quedar vacio.
- Si la edición es correcta, debe retornar los nuevos datos del deporte actualizados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Todos los campos son opcionales porque se trata de una actualizacion parcial.

- Endpoint: `PUT /api/v1/sports/:id`
- Request Body (`UpdateSportRequest`):

```ts
{
    description?: string;
    max_capacity?: number;
}
```
### Componentes de Arquitectura Hexagonal

1. **Entidad de Dominio**: `Sport` (Valida los datos).
2. **Puerto**: `SportRepository` (Metodos `findById(id)` y `update(id, data)`).
3. **Caso de Uso**: `UpdateSportUseCase` (Busca el deporte, combina los datos actuales con los enviados y valida la regla de negocio).
4. **Adaptador de Salida**: `PostgresSportRepository` (Actualización usando el método `update` de Prisma).
5. **Adaptador de Entrada**: `SportController` (Ruta HTTP que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                           | Código HTTP actual        |
| -------------------------- | ------------------------------------------------------------ | ------------------------- |
| Deporte inexistente            | Mensaje: "El deporte no existe"                         | 404  Not Found         |
| Capacidad no es mayor a cero  | Mensaje: "La capacidad maxima debe ser mayor a cero " | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"               | 500 Internal Server Error |
| Actualizacion exitosa      | Datos actualizados del deporte                                 | 200 OK                    |

## Plan de Implementación

1. Definir `UpdateSportRequest` en `@alentapp/shared`.
2. Ampliar `SportRepository` con los metodos `findById` y `update`.
3. Implementar la logica en `UpdateSportUseCase`.
4. Validar la regla `max_capacity > 0` con los datos finales .
5. Implementar la actualizacion en `PostgresSportRepository`.
6. Crear el endpoint `PUT /api/v1/sports/:id` en el `SportController`.
7. Agregar la edicion de deportes en el Frontend.
8. Agregar tests unitarios del caso de uso y tests de integracion del endpoint.








