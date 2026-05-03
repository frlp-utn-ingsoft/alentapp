---
id: 0027
estado: Propuesto
autor: Lucas Legorburu
fecha: 2026-05-03
titulo: Baja Lógica de Payment
---

# TDD-0026: Baja Lógica de Payment

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo cancele un pago registrado sin eliminarlo físicamente de la base de datos, cambiando su estado a `Cancelado`. Esta operación garantiza la inmutabilidad del historial de pagos del club y preserva la trazabilidad de todos los registros para fines de auditoría.

### User Persona

- **Nombre**: Laura (Administrativa de Tesorería).
- **Necesidad**: Anular un pago cargado por error o que ya no corresponde, sin perder el rastro del registro original, ya que la normativa interna del club exige que el historial financiero sea completo e inalterado.

### Criterios de Aceptación

- El sistema debe validar que el pago exista antes de intentar cancelarlo.
- El sistema **no debe borrar** el registro de la base de datos bajo ninguna circunstancia.
- La cancelación consiste únicamente en cambiar el campo `estado` a `Cancelado`.
- Si el pago ya tiene `estado: Cancelado`, el sistema debe rechazar la operación con un error.
- Al finalizar con éxito, el sistema debe retornar el objeto `Payment` con `estado: "Cancelado"` y el `actualizadoEl` actualizado.
- Una vez cancelado, el pago no puede ser reactivado ni modificado.

## Diseño Técnico (RFC)

### Modelo de Datos

No se realizan cambios en el esquema de Prisma. La cancelación es una actualización del campo `estado` sobre el registro existente:

- `estado`: Se sobreescribe con el valor `Cancelado` del enum `EstadoPago`.
- `actualizadoEl`: Actualizado automáticamente por Prisma (`@updatedAt`).
- Todos los demás campos (`monto`, `descripcion`, `fechaPago`, `miembro_id`, `creadoEl`) permanecen intactos.

### Contrato de API (@alentapp/shared)

Definiremos la operación como no destructiva en el contrato HTTP:

- **Endpoint**: `PATCH /api/v1/pagos/:id/cancelar`
- **Request Body**: Ninguno.
- **Response** `200 OK`:

```ts
{
    id: string;
    monto: number;
    descripcion: string | null;
    estado: 'Cancelado';
    fechaPago: string;
    miembro_id: string;
    creadoEl: string;
    actualizadoEl: string;
}
```

> Se utiliza `PATCH` en lugar de `DELETE` para dejar explícito en el contrato HTTP que la operación no destruye el recurso.

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interfaz en el Dominio), con `findById` y `update`.
2. Caso de Uso: CancelPayment (Recupera el pago, valida que no esté ya `Cancelado`, aplica `estado = Cancelado` y persiste).
3. Adaptador de Salida: Adaptador de persistencia en BD (`prisma.payment.update` con `data: { estado: 'Cancelado' }`).
4. Adaptador de Entrada: PaymentController (Ruta HTTP `PATCH /api/v1/pagos/:id/cancelar`).

## Casos de Borde y Errores

| Escenario                                   | Resultado Esperado                                                | Código HTTP               |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------- |
| `id` del pago no existe                     | Mensaje: "El pago indicado no existe"                             | 404 Not Found             |
| El pago ya tiene `estado: Cancelado`         | Mensaje: "El pago ya se encuentra cancelado"                      | 409 Conflict              |
| `id` con formato inválido (no UUID)         | Mensaje: "El identificador proporcionado no es válido"            | 400 Bad Request           |
| Intento de eliminar físicamente el registro | Operación no expuesta — no existe endpoint `DELETE /api/v1/pagos/:id` | N/A                    |
| Error de conexión a DB                      | Mensaje: "Error interno, reintente más tarde"                     | 500 Internal Server Error |

## Plan de Implementación

1. Agregar el método de dominio de cancelación en la entidad `Payment` (validación de `estado` previo).
2. Implementar el caso de uso `CancelPayment` en la capa de aplicación.
3. Reutilizar el método `update` del repositorio Prisma para persistir el cambio de `estado`.
4. Crear el endpoint `PATCH /api/v1/pagos/:id/cancelar` en `PaymentController`.
5. Agregar el botón "Cancelar pago" en la vista de detalle del frontend, con confirmación previa antes de ejecutar la operación.
