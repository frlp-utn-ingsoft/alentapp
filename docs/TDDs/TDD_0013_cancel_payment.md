---
id: "0013"
estado: Propuesto
autor: Hajime
fecha: 2026-05-02
titulo: Cancelación de Pago
---

# TDD-0013: Cancelación de Pago

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos cancelar un pago registrado por error o por devolución acordada. La regla de inmutabilidad de la entidad `Payment` prohíbe el borrado físico de registros; por lo tanto, la baja consiste en cambiar el `status` del pago a `"Canceled"`, preservando el historial completo para auditorías.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Anular un pago cargado por error sin perder el registro, garantizando trazabilidad del historial financiero del socio.

### Criterios de Aceptación

- El sistema debe validar que el pago exista antes de intentar cancelarlo.
- El sistema **no debe permitir** el borrado físico del registro bajo ninguna circunstancia.
- El sistema solo debe permitir cancelar un pago que esté en estado `"Pending"` o `"Paid"`. Un pago ya en `"Canceled"` no puede cancelarse nuevamente.
- El sistema no debe exponer ningún endpoint `DELETE` para pagos; el borrado físico está prohibido por la regla de inmutabilidad financiera.
- Si la operación es correcta, el pago debe quedar con `status = "Canceled"` y el sistema debe devolver sus datos actualizados.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de un cambio de estado que solo requiere conocer el identificador, no se envía cuerpo en la petición.

- Endpoint: `PATCH /api/v1/payments/:id/cancel`
- Request Body: `None`
- Response (`PaymentResponse`):

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: "Canceled";
    dueDate: string;
    paymentDate: string | null;
    memberId: string;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Payment` con la regla de inmutabilidad: no existe operación de borrado; el único cambio de estado permitido es hacia `"Canceled"`. No se expone ningún endpoint `DELETE`.
- **Application**: Caso de uso `CancelPaymentUseCase` (verifica existencia del pago, valida que su estado actual permita la cancelación y delega la actualización). Puerto: `PaymentRepository` (método `cancel(id)` que actualiza únicamente el campo `status`).
- **Infrastructure**: `PostgresPaymentRepository` (usa `prisma.payment.update` para cambiar el `status`; el método `delete` de Prisma nunca es invocado). `PaymentController` (ruta `PATCH /api/v1/payments/:id/cancel` que devuelve los datos actualizados con status 200).

## Casos de Borde y Errores

| Escenario                      | Resultado Esperado                                           | Código HTTP               |
| ------------------------------ | ------------------------------------------------------------ | ------------------------- |
| Pago inexistente               | Mensaje: "El pago especificado no existe"                    | 404 Not Found             |
| Pago ya cancelado              | Mensaje: "El pago ya se encuentra cancelado"                 | 409 Conflict              |
| Error de conexión a DB         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |
| Cancelación exitosa            | Datos del pago con status "Canceled"                         | 200 OK                    |

## Plan de Implementación

1. Ampliar el `PaymentRepository` con el método `cancel(id)`.
2. Implementar `CancelPaymentUseCase` con la validación del estado actual.
3. Implementar el método `cancel` en `PostgresPaymentRepository` usando `prisma.payment.update` (nunca `delete`).
4. Crear el endpoint `PATCH /api/v1/payments/:id/cancel` en el `PaymentController` y registrarlo en `app.ts`.
5. Agregar el botón de cancelación en el Frontend con confirmación visual previa (`window.confirm`).
6. Agregar tests unitarios del caso de uso y tests de integración del endpoint.