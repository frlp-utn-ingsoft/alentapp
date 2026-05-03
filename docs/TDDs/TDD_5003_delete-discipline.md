---
id: 5003
estado: Pendiente
autor: Agustín Manrique
fecha: 2026-05-03
titulo: Baja de Sanción Disciplinaria (Eliminar)
---

# TDD-5003: Baja de Sanción Disciplinaria (Eliminar)

## Contexto de Negocio (PRD)

### Objetivo
Permitir al personal del club dar de baja una sanción disciplinaria, desactivándola del sistema sin eliminar el registro físico para preservar el historial de medidas aplicadas.

### User Persona
* **Nombre**: Personal del Club (Administrativo).
* **Necesidad**: Dar de baja una sanción disciplinaria que ya no corresponde aplicar, sin perder el registro histórico de la medida.

### Criterios de Aceptación
* El sistema debe validar que la sanción a dar de baja exista.
* El sistema debe validar que la sanción no esté ya dada de baja (`is_active: false`).
* La baja es lógica: el sistema cambia `is_active` a `false`, el registro se mantiene en la base de datos.
* Al finalizar, el sistema debe retornar una respuesta vacía.

## Diseño Técnico (RFC)

### Modelo de Datos
Sin cambios en Prisma. Se actualiza el campo `is_active` a `false` en el registro existente.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `DELETE /api/v1/disciplines/:id`
* **Request Body**: None
* **Response**: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal
* **Domain**: Regla de baja lógica: no se elimina físicamente el registro.
* **Application**: Caso de Uso `DeleteDiscipline`. Puerto: `DisciplineRepository.deactivate(id: string)`.
* **Infrastructure**: Implementación con Prisma actualizando `is_active` a `false` y `DisciplineController` para la ruta DELETE.

## Casos de Borde y Errores
| Escenario               | Resultado Esperado                                 | Código HTTP               |
| ----------------------- | -------------------------------------------------- | ------------------------- |
| Sanción inexistente     | Mensaje: "No existe una sanción con ese ID"        | 404 Not Found             |
| Sanción ya dada de baja | Mensaje: "La sanción ya se encuentra dada de baja" | 409 Conflict              |
| Error de conexión a DB  | Mensaje: "Error interno, reintente más tarde"      | 500 Internal Server Error |
| Baja exitosa            | Respuesta vacía                                    | 204 No Content            |

## Plan de Implementación
1. Agregar método `deactivate(id)` al puerto `DisciplineRepository`.
2. Implementar el caso de uso `DeleteDiscipline`.
3. Implementar el método `deactivate` en `PostgresDisciplineRepository`.
4. Crear el endpoint `DELETE /api/v1/disciplines/:id` en `DisciplineController`.
