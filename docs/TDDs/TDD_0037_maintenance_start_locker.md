---
id: "0037"
estado: Propuesto
autor: Mariano
fecha: 2026-05-04
titulo: Poner Locker en Mantenimiento
---

# TDD-[0037]: Poner Locker en Mantenimiento

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un administrativo o personal de mantenimiento cambie el estado de un casillero a "Mantenimiento", bloqueando temporalmente su alquiler por roturas, limpieza o refacciones.

### User Persona
*   **Nombre**: Alberto (Administrativo) o Personal de Mantenimiento.
*   **Necesidad**: Inhabilitar temporalmente un casillero dañado para asegurar que ningún recepcionista se lo asigne por error a un socio.

### Criterios de Aceptación
* CA 1 - El sistema debe validar que el Locker exista en la base de datos.
* CA 2 - Regla de Negocio: El sistema debe validar que el status actual del locker sea `Available`. Si el locker se encuentra `Occupied`, el sistema debe rechazar la operación solicitando que primero se libere el casillero. Si ya está en `Maintenance`, debe retornar un error indicando que ya se encuentra en ese estado.
* CA 3 - Al ejecutarse con éxito, el `status` del locker debe actualizarse a `Maintenance`.
* CA 4 - El campo `member_id` debe mantenerse nulo.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`. No se requieren modificaciones estructurales en `schema.prisma`, solo la actualización del campo `status` a `Maintenance` en un registro existente.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `PATCH /api/v1/lockers/:id/maintenance/start`
*   **Request Body**: `None`
*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Maintenance';
    memberId: null;
}
```

### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Método `updateStatus(id, newStatus, expectedStatus)`
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el estado del locker sea `Available` antes de inhabilitarlo.
*   **Caso de Uso**: `StartLockerMaintenanceUseCase` Orquesta la validación de estado y llama al repositorio para actualizar el `status`.
*   **Adaptador de Salida**: `PostgresLockerRepository` Actualización en base de datos usando el método `update` de Prisma.
*   **Adaptador de Entrada**: `LockerController` Ruta HTTP PATCH, extrae el ID de la URL y mapea excepciones a códigos HTTP.

### Casos de Borde y Errores
| Escenario de Error | Validación / Regla de Negocio                                       | Código HTTP               |
| ------------------ | ------------------------------------------------------------------- | ------------------------- |
| El `id` del locker no existe en la BD | El sistema devuelve error de recurso no encontrado                  | 404 Not Found             |
| El locker tiene estado `Occupied` | No se puede enviar a mantenimiento un casillero en uso `Occupied`. | 400 Bad Request           |
| El locker ya está en `Maintenance` | El casillero ya se encuentra en estado `Maintenance`.                 | 400 Bad Request           |

### Plan de Implementación
1. Actualizar el puerto `LockerRepository` con el método para cambiar el estado si es necesario.
2. Implementar `StartLockerMaintenanceUseCase` orquestando la regla de negocio.
3. Crear el endpoint `PATCH /api/v1/lockers/:id/maintenance/start` en el `LockerController`.
4. Agregar en el Frontend un botón/acción "Enviar a Mantenimiento" visible solo en los lockers con estado "Disponible".
5. Agregar tests unitarios del caso de uso asegurando que rechace casilleros ocupados, y tests de integración del endpoint.