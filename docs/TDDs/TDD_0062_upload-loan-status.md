---
id: "0062"
estado: Propuesto
autor: Julian Coloma
fecha: 2026-05-01
titulo: Devolución y Actualización de Estado de Equipamiento
---

# TDD-0062: Devolución y Actualización de Estado

## Contexto de Negocio (PRD)

### Objetivo
Registrar el reingreso del material al inventario del club y dejar constancia del estado físico en el que se devuelve para gestionar posibles reparaciones o reposiciones.

### User Persona
* **Nombre**: Alberto (Tesorero/Administrativo).
* **Necesidad**: Marcar un préstamo como finalizado de forma rápida cuando el socio entrega el material, pudiendo reportar si el objeto sufrió daños.

### Criterios de Aceptación
* El sistema debe permitir cambiar el estado del préstamo a "Returned" o "Damaged".
* Si el estado es "Damaged", el sistema debe registrarlo para que el material no sea prestado nuevamente hasta su reparación.
* No se puede modificar un préstamo que ya está en estado "Returned".

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)
* **Endpoint**: `PATCH /api/v1/equipment-loan/:id/status`
* **Request Body** (UpdateLoanStatusRequest):
```ts
{
    status: 'Returned' | 'Damaged';
}
```
- **Response** (Success): 200 ok
```ts
{
    id: string;
    member_id: string;
    item_name: string;
    loan_date: string;
    due_date: string;
    status: 'Returned' | 'Damaged'; // El nuevo estado actualizado
}
```
### Componentes de Arquitectura Hexagonal

1. **Caso de Uso**: `UpdateLoanStatusUseCase` (Valida el estado actual antes de ejecutar la transición).
2. **Adaptador de Salida**: `PostgresLoanRepository` (Método `updateStatus` implementado con Prisma).

## Casos de Borde y Errores

| Escenario                   | Resultado Esperado                                              | Código HTTP     |
| --------------------------- | --------------------------------------------------------------- | --------------- |
| Préstamo ya devuelto        | Mensaje: "El préstamo ya fue marcado como devuelto anteriormente" | 400 Bad Request |
| ID de préstamo inexistente  | Mensaje: "No se encontró el registro del préstamo"              | 404 Not Found   |

## Plan de Implementación

1. Añadir el tipo `UpdateLoanStatusRequest` a `@alentapp/shared`.
2. Implementar la lógica de transición de estados en el dominio.
3. Crear el endpoint `PATCH` en el controlador de préstamos.
4. Añadir el botón "Devolver" en la lista de préstamos del frontend.