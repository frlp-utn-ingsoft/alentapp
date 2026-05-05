---
id: "0038"
estado: Propuesto
autor: Mariano
fecha: 2026-05-04
titulo: Finalizar Mantenimiento de Locker
---

# TDD-[0038]: Finalizar Mantenimiento de Locker

## Contexto de Negocio (PRD)

### Objetivo
Rehabilitar un casillero que se encontraba inhabilitado por refacciones, volviendo a dejarlo disponible para que los socios lo alquilen.

### User Persona
*   **Nombre**: Alberto (Administrativo) o Personal de Mantenimiento.
*   **Necesidad**: Marcar como "Disponible" un casillero que ya fue reparado o limpiado, reincorporándolo al pool de alquileres activos.

### Criterios de Aceptación
* CA 1 - El sistema debe validar que el Locker exista en la base de datos.
* CA 2 - Regla de Negocio: El sistema debe validar que el status actual del locker sea estrictamente `Maintenance`. Si el locker está `Available` u `Occupied`, la operación debe rechazarse por inconsistencia de estados.
* CA 3 - Al ejecutarse con éxito, el `status` del locker debe actualizarse a `Available`, garantizando que el `member_id` se mantenga nulo.

## Diseño Técnico (RFC)

### Modelo de Datos
Entidad `Locker`. No se requieren modificaciones en `schema.prisma`, solo la actualización del campo `status` a `Available` sobre un registro existente.

### Contrato de API (@alentapp/shared)
*   **Endpoint**: `PATCH /api/v1/lockers/:id/maintenance/end`
*   **Request Body**: `None`
*   **Response Body (LockerResponse)**:
```ts
{
    id: string;
    number: number;
    location: string;
    status: 'Available';
    memberId: null;
}
```

### Componentes de Arquitectura Hexagonal
*   **Puerto**: `LockerRepository` Se reutiliza el método `updateStatus(id, newStatus, expectedStatus)`.
*   **Servicio de Dominio**: `LockerValidator` Encargado de validar que el locker provenga efectivamente del estado `Maintenance`.
*   **Caso de Uso**: `EndLockerMaintenanceUseCase` Orquesta la validación y llama al repositorio para retornar el locker a su disponibilidad operativa.
*   **Adaptador de Salida**: `PostgresLockerRepository` Actualización mediante método `update` de Prisma.
*   **Adaptador de Entrada**: `LockerController` Ruta HTTP PATCH, extrae el ID de la URL y mapea excepciones a códigos HTTP.

### Casos de Borde y Errores
| Escenario de Error | Validación / Regla de Negocio | Código HTTP               |
| ------------------ | ------------------------------- | ------------------------- |
| El `id` del locker no existe en la BD | El sistema devuelve error de recurso no encontrado | 404 Not Found             |
| Inconsistencia de estado | El casillero no se encuentra actualmente en estado `Maintenance` | 400 Bad Request           |

### Plan de Implementación.
1. Implementar `EndLockerMaintenanceUseCase` con la validación de estado origen.
2. Crear el endpoint `PATCH /api/v1/lockers/:id/maintenance/end` en el `LockerController`.
3. Agregar en el Frontend un botón/acción "Habilitar" visible únicamente en los lockers que tengan estado "En Mantenimiento".
4. Agregar tests unitarios del caso de uso verificando la validación del estado origen, y tests de integración del endpoint.
