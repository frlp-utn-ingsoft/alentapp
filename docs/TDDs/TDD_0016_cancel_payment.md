---

id: 0007
estado: Propuesto
autor: [Abel Di Bella]
fecha: 2026-04-27
titulo: Cancelación de Pagos
----------------------------

# TDD-0007: Cancelación de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir al tesorero anular un pago registrado sin eliminarlo del sistema, garantizando la trazabilidad de las operaciones financieras y cumpliendo con las reglas de auditoría.

### User Persona

* **Nombre**: Alberto (Tesorero).
* **Necesidad**: Poder corregir errores anulando pagos sin perder el historial, ya que los registros financieros no deben eliminarse.

### Criterios de Aceptación

* El sistema debe permitir cambiar el estado de un pago a **"CANCELED"**.
* El sistema no debe permitir eliminar pagos del sistema.
* El sistema debe mantener el registro del pago aun cuando esté cancelado.
* El sistema no debe permitir cancelar un pago que ya fue cancelado previamente.
* El sistema debe confirmar la cancelación del pago.

---

## Diseño Técnico (RFC)

### Modelo de Datos

La entidad `Payment` mantiene la misma estructura:

* `id`: Identificador único.
* `memberId`: Referencia al socio.
* `monto`: Número positivo.
* `mesReferencia`: Número entero.
* `anioReferencia`: Número entero.
* `fechaVencimiento`: Fecha límite.
* `estado`: Enumeración (`PENDING`, `PAID`, `CANCELED`).
* `fechaPago`: Fecha opcional.

---

### Contrato de API (@alentapp/shared)

* **Endpoint**: `PATCH /api/v1/payments/:id/cancel`
* **Request Body:**
  (No requiere body)

```ts id="7b2k9p"
{}
```

---

### Componentes de Arquitectura Hexagonal

1. **Domain**:
   Entidad `Payment` con la regla de negocio de inmutabilidad (no eliminación).

2. **Application**:
   Caso de uso `CancelPayment`, encargado de cambiar el estado a **"CANCELED"** y validar que no esté previamente cancelado.

3. **Infrastructure**:

   * Adaptador de salida: Repositorio que persiste el cambio de estado.
   * Adaptador de entrada: `PaymentController`.

---

## Casos de Borde y Errores

| Escenario              | Resultado Esperado                            | Código HTTP               |
| ---------------------- | --------------------------------------------- | ------------------------- |
| Pago inexistente       | Mensaje: "Pago no encontrado"                 | 404 Not Found             |
| Pago ya cancelado      | Mensaje: "El pago ya se encuentra cancelado"  | 400 Bad Request           |
| Intento de eliminación | Mensaje: "No se permite eliminar pagos"       | 403 Forbidden             |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

---

## Plan de Implementación

1. Implementar el caso de uso `CancelPayment`.
2. Validar que el pago exista antes de cancelarlo.
3. Verificar que el estado no sea ya **CANCELED**.
4. Cambiar el estado del pago a **"CANCELED"**.
5. Persistir el cambio en el repositorio.
6. Exponer endpoint en `PaymentController`.
