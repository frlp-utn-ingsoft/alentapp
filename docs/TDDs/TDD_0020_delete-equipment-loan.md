---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Eliminación de Préstamo de Equipamiento
---

# TDD-0020: Eliminación de Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo cancele un registro de préstamo de equipamiento, manteniendo el historial completo de préstamos del club sin eliminar físicamente el registro.

### User Persona

- **Nombre**: administrativo
- **Necesidad**: Borrar un préstamo registrado incorrectamente. Necesita confirmación de que la operación fue exitosa.

### Criterios de Aceptación

- El sistema no debe eliminar físicamente el registro del préstamo.
- El sistema debe cambiar el status del préstamo a "Canceled".
- Si el préstamo no existe, el sistema debe retornar un error claro.
- Si el préstamo ya tiene status "Canceled", la operación no debe generar cambios.
- Al finalizar, el sistema debe retornar el registro actualizado.

## Diseño Técnico (RFC)

### Modelo de Datos

No se requieren cambios en el modelo, pero se extiende el enum `EquipmentLoanStatus` agregando el valor `Canceled`. Se utiliza la entidad `EquipmentLoan` definida en TDD-0019.
- `status`: String, estado del préstamo (`Loaned`, `Returned`, `Damaged`, `Canceled`).

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/equipment-loans/:id`
- **Request Body**: No aplica.
- **Response Body**:

```ts
{
    id: string;
    item_name: string;
    status: 'Loaned' | 'Returned' | 'Damaged' | 'Canceled';
    loan_date: string;
    due_date: string;
    member_id: string;
}
```
### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `EquipmentLoanRepository` con método `delete`. Regla de negocio: no se permite borrado físico, solo cambio de status a `Canceled`.
- **Application**: Caso de uso `DeleteEquipmentLoan` que verifica existencia del registro, valida que no esté ya cancelado y cambia el status a `Canceled`.
- **Infrastructure**: `EquipmentLoanRepositoryPrisma`, `EquipmentLoanController` con ruta HTTP DELETE.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `id` de préstamo inexistente | Mensaje: "El préstamo no existe" | 404 Not Found |
| Préstamo ya cancelado | Sin cambios, operación innecesaria | 200 OK |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |


## Plan de Implementación

1. Extender enum `EquipmentLoanStatus` agregando el valor `Canceled` en `schema.prisma`.
2. Actualizar `EquipmentLoanDTO` en `@alentapp/shared` con el nuevo valor del enum.
3. Agregar método `delete` a `EquipmentLoanRepository` e implementar en `EquipmentLoanRepositoryPrisma`.
4. Implementar caso de uso `DeleteEquipmentLoan` que cambia el status a `Canceled`.
5. Agregar ruta `DELETE /api/v1/equipment-loans/:id` en `EquipmentLoanController`.