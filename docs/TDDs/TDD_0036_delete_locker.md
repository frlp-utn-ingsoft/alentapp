---
id: "0036"
estado: Propuesto
autor: Mariano
fecha: 2026-05-04
titulo: Eliminación de Locker
---

# TDD-[0036]: Eliminación de Locker

## Contexto de Negocio (PRD)

### Objetivo
Permitir el borrado físico de un casillero del sistema en caso de que haya sido ingresado por error o sea retirado definitivamente de las instalaciones.

### User Persona
*   **Nombre**: Alberto (Tesorero/Administrativo).
*   **Necesidad**: Mantener la base de datos limpia de casilleros que no existen físicamente o que fueron destruidos, garantizando que el inventario del sistema coincida con la realidad.

### Criterios de Aceptación
* CA 1 - El sistema debe validar que el Locker exista en la base de datos antes de proceder.
* CA 2 - Regla de Negocio: Solo se permite la eliminación de un locker si su estado es `Available` o `Maintenance`. Si el locker se encuentra `Occupied` (tiene un socio asignado), la operación debe ser rechazada para evitar pérdida de consistencia en alquileres activos.
* CA 3 - El sistema debe realizar el borrado físico del registro en la base de datos.
* CA 4 - Si la eliminación es exitosa, el sistema no debe devolver contenido (204).

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`. No se requieren modificaciones en `schema.prisma`. Se realizará un borrado físico (`delete`).

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `DELETE /api/v1/lockers/:id`
*   **Request Body**: `None`
*   **Response**: `204 No Content` (en caso de éxito).

### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` (Métodos `findById(id)` y `delete(id)`).
*   **Caso de Uso**: `DeleteLockerUseCase` (Comprueba la existencia del locker, valida que su estado no sea `Occupied` y delega la eliminación al repositorio).
*   **Adaptador de Salida**: `PostgresLockerRepository` (Eliminación usando el método `delete` de Prisma).
*   **Adaptador de Entrada**: `LockerController` (Ruta HTTP DELETE que extrae el `id` de la URL y devuelve status 204).

## Casos de Borde y Errores
| Escenario de Error          | Validación / Regla de Negocio                 | Código HTTP               |
| ----------------------------| -------------------------------------------- | ------------------------- |
| El id del locker no existe en la BD | El sistema devuelve error de recurso no encontrado | 404 Not Found             |
| El locker tiene estado `Occupied` | No se puede eliminar un casillero que actualmente está siendo alquilado por un socio. | 400 Bad Request           |

## Plan de Implementación
1. Ampliar `LockerRepository` y `PostgresLockerRepository` con el método `delete`.
2. Crear la lógica de negocio en `DeleteLockerUseCase` implementando la restricción de estado.
3. Crear el endpoint `DELETE /api/v1/lockers/:id` en el `LockerController`.
4. Agregar el botón de eliminación (con confirmación de usuario) en la vista de listado de lockers del Frontend.
5. Agregar tests unitarios del caso de uso (validando el rechazo de eliminación para lockers ocupados) y tests de integración del endpoint.