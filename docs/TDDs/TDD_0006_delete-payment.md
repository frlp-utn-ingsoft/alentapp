---
autor: [Valentina Pértile de la Vega]
fecha: [2026-05-01]
titulo: Delete Payment
---

# TDD-[0006]: Eliminar Payment (Borrado Lógico)

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar un pago de forma lógica, cambiando su estado a `Canceled` sin borrar físicamente el registro. ES UN CAMBIO EXCLUSIVAMENTE LÓGICO

### User Persona

- **Nombre**: Administrativo del club
- **Necesidad**: Eliminar un pago registrado sin perder el historial.

### Criterios de Aceptación

- El sistema no debe eliminar físicamente el registro.
- El sistema debe cambiar el estado del pago a `Canceled`.
- El pago debe existir para poder ser eliminado.
- Si el pago ya se encuentra en estado `Canceled`, la operación no debe generar cambios.


## Diseño Técnico (RFC)

### Modelo de Datos

Entidad existente `PAYMENT`:

- `id`: uuid (PK)
- `amount`: float
- `year`: int
- `month`: int
- `status`: string (Pending, Canceled y Paid)
- `due_date`: date
- `payment_date`: datetime (nullable)
- `member_id`: uuid (FK → MEMBER)

### Contrato de API (@alentapp/shared)

- **Endpoint**: `DELETE /api/v1/payments/:id`
- **Request Body:** No aplica.
- **Response**: `200 OK` con el payment actualizado (status = `Canceled`).
- **Response Body**:

```ts
{
  id: string;
  amount: number;
  month: number;
  year: number;
  status: "Canceled";
  due_date: string;
  payment_date: string | null;
  member_id: string;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Payment`. Regla: no se permite borrado físico, solo cambio de estado a `Canceled`.
- **Application**: Caso de uso `DeletePayment`. Puerto de salida `PaymentRepository`.
- **Infrastructure**: `PaymentController` (DELETE). `PrismaPaymentRepository`.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| `id` inexistente | Error: pago no encontrado | 404 Not Found |
| Pago ya cancelado | Operación innecesaria, sin cambios | 200 OK |

## Plan de Implementación

1. Definir método `delete` en `PaymentRepository`
2. Implementar caso de uso `DeletePayment`
3. Buscar el pago por `id`
4. Validar existencia
5. Actualizar `status` a `Canceled`
6. Implementar endpoint `DELETE /api/v1/payments/:id`