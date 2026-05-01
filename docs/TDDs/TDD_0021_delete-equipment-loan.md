---
autor: Macarena Romero Olmo
fecha: 2026-05-01
titulo: Eliminación de Préstamo de Equipamiento
---

# TDD-0021: Eliminación de Préstamo de Equipamiento

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo elimine un registro de préstamo de equipamiento cargado por error, manteniendo la integridad del inventario del club.

### User Persona

- **Nombre**: administrativo
- **Necesidad**: Borrar un préstamo registrado incorrectamente. Necesita confirmación de que la operación fue exitosa.

### Criterios de Aceptación

- El sistema debe eliminar el registro de préstamo correspondiente al `id` indicado.
- Si el préstamo no existe, el sistema debe retornar un error claro.
- Al finalizar, el sistema debe confirmar la eliminación.

## Diseño Técnico (RFC)

### Modelo de Datos

No se requieren cambios en el modelo. Se utiliza la entidad `EquipmentLoan` definida en TDD-0019.

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/equipment-loans/:id`
- **Request Body**: No aplica.
- **Response Body**:

```ts
{
    message: "Préstamo eliminado correctamente";
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Interfaz `EquipmentLoanRepository` con método `delete`.
- **Application**: Caso de uso `DeleteEquipmentLoan` que verifica existencia del registro y ejecuta la eliminación.
- **Infrastructure**: `EquipmentLoanRepositoryPrisma`, `EquipmentLoanController` con ruta HTTP DELETE.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
| --- | --- | --- |
| `id` de préstamo inexistente | Mensaje: "El préstamo no existe" | 404 Not Found |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

## Plan de Implementación

1. Agregar método `delete` a `EquipmentLoanRepository` e implementar en `EquipmentLoanRepositoryPrisma`.
2. Implementar caso de uso `DeleteEquipmentLoan`.
3. Agregar ruta `DELETE /api/v1/equipment-loans/:id` en `EquipmentLoanController`.