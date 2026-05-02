---
id: 0012
estado: Pendiente
autor: Ernesto Ardenghi
fecha: 2026-05-02
titulo: Baja/Cancelación de Pagos
---

# TDD-0004: Baja/Cancelación de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Gestionar la anulación de pagos registrados sin eliminar físicamente el registro, cumpliendo estrictamente con la regla de inmutabilidad y garantizando la trazabilidad contable para auditorías.

### User Persona

- Nombre: Anastasia (Tesorera/Administrativa).
- Necesidad: Anular una cuota duplicada, un error de carga o un pago que nunca se concretó, manteniendo el histórico intacto.

### Criterios de Aceptación

- El sistema NO permite borrado físico (endpoint `DELETE` bloqueado o no implementado).
- La operación debe cambiar únicamente el `status` a "Canceled".
- Solo se pueden cancelar pagos en estado "Pending". Los pagos "Paid" requieren un proceso de reversión/reembolso (fuera de este alcance).
- Al finalizar, el sistema retorna 200 OK con el estado actualizado.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una operación 'destructiva' que solo requiere conocer el identificador, no se envía cuerpo en la petición HTTP.

- Endpoint: `PATCH/ /api/v1/pagos/:id/cancelar`
- Request Body: `None
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository` (Método `cancel(id)`).
2. **Caso de Uso**: `CancelPaymentUseCase` (Verifica estado actual, transiciona a "Canceled", bloquea `DELETE` físico).
3. **Adaptador de Salida**: `PostgreSQLPaymentRepository` (Actualización usando el método update de Prisma).
4. **Adaptador de Entrada**: `PaymentController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

### Casos de Borde y Errores

| Escenario                               | Resultado Esperado                                    | Código HTTP               |
| --------------------------------------- | ----------------------------------------------------- | ------------------------- |
| Intento de borrado físico (HTTP DELETE) | Bloqueado por validación de ruta/middleware           | 405 Method Not Allowed    |
| Pago ya se encuentra "Canceled"         | Mensaje: "El pago ya se encuentra cancelado"          | 409 Conflict              |
| Pago ya está en estado "Paid"           | Mensaje: "No se puede cancelar un pago ya acreditado" | 400 Bad Request           |
| Error de conexión a DB                  | Mensaje: "Error interno, reintente más tarde"         | 500 Internal Server Error |

Plan de Implementación

1. Ampliar el `PaymentRepository`y `PostgresPaymentRepository`con el método `cancel`.
2. Crear la lógica de negocio en `CancelPaymentUseCase` con validación de estado previo.
3. Crear el endpoint `PATCH /api/v1/payments/:id/cancelar`en el `PaymentController` y registrarlo en `app.ts`.
4. Configurar router para rechazar explícitamente `DELETE /api/v1/pagos/:id`.
5. Añadir botón de "Cancelar" en la UI de React que invoque el endpoint correcto.
