---
id: 0006
estado: Aprobado
autor: Benjamín Briones
fecha: 2026-05-02
titulo: Cancelación de Pagos de Socios
---

# TDD-0006: Cancelación de Pagos de Socios

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja un pago sin eliminarlo físicamente de la base de datos, preservando la trazabilidad de los movimientos económicos.

A diferencia de otras entidades, los pagos representan registros contables. Por este motivo, no deben borrarse físicamente. Cuando un pago se anula, el sistema debe conservar el registro y cambiar su estado a `Canceled`.

### User Persona

*   **Nombre**: Administrador de Pagos
*   **Rol**: Tesorero/Administrativo
*   **Necesidad**: Anular pagos cargados por error o que ya no correspondan, sin perder información histórica ni alterar la trazabilidad contable del socio.

### Criterios de Aceptación

*   El sistema debe permitir cancelar un pago existente.
*   El sistema debe validar que el pago exista antes de cancelarlo.
*   El sistema no debe realizar borrado físico del registro.
*   La baja del pago debe interpretarse como una cancelación lógica.
*   Al cancelar un pago, el campo `status` debe cambiar a `Canceled`.
*   El pago cancelado debe permanecer guardado en la base de datos.
*   Si el pago ya se encuentra cancelado, el sistema debe informarlo.
*   El sistema debe pedir confirmación explícita antes de cancelar el pago.
*   Si la cancelación es exitosa, el sistema debe retornar el pago con estado `Canceled`.

## Diseño Técnico (RFC)

### Modelo de Datos

La cancelación operará sobre la entidad `Payment` existente:

*   `id`: UUID. Identificador único del pago.
*   `status`: Enum. Debe actualizarse a `Canceled`.
*   `payment_date`: DateTime nullable. Se conserva según el estado previo del pago.
*   `updated_at`: DateTime. Se actualiza al momento de cancelar el pago.

Regla de negocio principal:

*   No se permite `hard delete` sobre registros de `Payment`.
*   Un pago solo puede darse de baja cambiando su `status` a `Canceled`.

### Contrato de API (@alentapp/shared)

Para evitar ambigüedad con un borrado físico, se propone usar un endpoint explícito de cancelación.

*   **Endpoint**: `PATCH /api/v1/payments/:id/cancel`
*   **Request Body**: `None`

*   **Response esperada**: `200 OK`

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Canceled';
    due_date: string;
    payment_date: string | null;
    member_id: string;
    created_at: string;
    updated_at: string;
}
```

//No se debe implementar un DELETE /api/v1/payments/:id que elimine físicamente el registro, ya que esto incumple la regla de negocio de inmutabilidad de pagos.

## Componentes de Arquitectura Hexagonal

1. **Domain**:
    - Entidad Payment.
    - Enumeración PaymentStatus.
    - Regla de negocio:
        Un pago no puede eliminarse físicamente.
        La baja de un pago equivale a cambiar su estado a Canceled.
        Un pago ya cancelado no debería volver a cancelarse.
2. **Application**:
    - Puerto PaymentRepository.
    - Caso de uso CancelPaymentUseCase.
    - Validación de existencia del pago mediante findById.
    - Validación de que el pago no esté previamente cancelado.
    - Actualización del campo status a Canceled.
Infrastructure:
    - Adaptador de salida PostgresPaymentRepository.
    - Método cancel(id) o reutilización controlada de update(id, { status: 'Canceled' }).
    - Controlador HTTP PaymentController.
    - Ruta PATCH /api/v1/payments/:id/cancel.
    - Confirmación visual en el frontend antes de ejecutar la operación.

## Casos de Borde y Errores

| Escenario                 | Resultado Esperado                                          | Código HTTP               |
| ------------------------- | ----------------------------------------------------------- | ------------------------- |
| Pago inexistente          | Mensaje: "El pago no existe"                                | 404 Not Found             |
| Pago ya cancelado         | Mensaje: "El pago ya se encuentra cancelado"                | 409 Conflict              |
| Cancelación exitosa       | El pago permanece guardado y su estado cambia a `Canceled`  | 200 OK                    |
| Intento de borrado físico | El sistema no debe eliminar el registro de la base de datos | 400 Bad Request           |
| Error de conexión a DB    | Mensaje: "Error interno, reintente más tarde"               | 500 Internal Server Error |

## Plan de Implementación

1. Confirmar que la entidad Payment tenga el estado Canceled dentro de PaymentStatus.
2. Ampliar el puerto PaymentRepository con el método cancel(id) o reutilizar update de forma controlada.
3. Implementar el método de cancelación en PostgresPaymentRepository sin usar operaciones de borrado físico.
4. Crear el caso de uso CancelPaymentUseCase.
5. Validar la existencia del pago antes de cancelarlo.
6. Validar que el pago no esté previamente cancelado.
7. Actualizar únicamente el campo status a Canceled.
8. Crear el endpoint PATCH /api/v1/payments/:id/cancel en PaymentController.
9. Mapear errores de dominio a códigos HTTP.
10. Agregar en el frontend una confirmación antes de cancelar el pago.
11. Actualizar la tabla o vista de pagos luego de una cancelación exitosa.
12. Probar que ningún flujo elimine físicamente registros de Payment.