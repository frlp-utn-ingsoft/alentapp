---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Actualización de Préstamo de Equipamiento
---

# TDD-0020: Actualización de Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo modifique los datos de un préstamo de equipamiento existente, por ejemplo para registrar la devolución del material o reportar que fue dañado.

### User Persona

- **Nombre**: Alberto (Administrativo).
- **Necesidad**: Actualizar el estado de un préstamo cuando el socio devuelve el equipamiento o cuando se detecta que fue dañado, sin tener que eliminar y recrear el registro.

### Criterios de Aceptación

- El sistema debe permitir actualizar el `status` del préstamo a "Returned" o "Damaged".
- El sistema debe retornar el registro actualizado.
- Si el préstamo no existe, el sistema debe retornar un error claro.
- Solo se actualizan los campos enviados (actualización parcial).

## Diseño Técnico (RFC)

### Modelo de Datos

No se requieren cambios en el modelo. Se utiliza la entidad `EquipmentLoan` definida en TDD-0019.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `PATCH /api/v1/equipment-loans/:id`
- **Request Body**:

```ts
export interface UpdateEquipmentLoanRequest {
    item_name?: string;
    status?: EquipmentLoanStatus; // 'Loaned' | 'Returned' | 'Damaged'
    loan_date?: string; // ISO DateTime string
    due_date?: string;  // ISO DateTime string
}
```

- **Response Body**: `EquipmentLoanDTO` (definido en TDD-0019).

### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `EquipmentLoanRepository` con método `update`.
- **Application**: Caso de uso `UpdateEquipmentLoan` que verifica existencia del registro, aplica los cambios parciales y persiste.
- **Infrastructure**: `EquipmentLoanRepositoryPrisma`, `EquipmentLoanController` con ruta HTTP PATCH.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `id` de préstamo inexistente | Mensaje: "El préstamo no existe" | 404 Not Found |
| `status` con valor inválido | Mensaje: "Estado inválido. Los valores permitidos son: Loaned, Returned, Damaged" | 400 Bad Request |
| Body vacío (sin campos) | Se retorna el registro sin cambios | 200 OK |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Definir `UpdateEquipmentLoanRequest` en `@alentapp/shared`.
2. Agregar método `update` a `EquipmentLoanRepository` e implementar en `EquipmentLoanRepositoryPrisma`.
3. Implementar caso de uso `UpdateEquipmentLoan`.
4. Agregar ruta `PATCH /api/v1/equipment-loans/:id` en `EquipmentLoanController`.