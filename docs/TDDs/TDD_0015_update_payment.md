---

id: 0006
estado: Propuesto
autor: [Abel Di Bella]
fecha: 2026-04-27
titulo: Actualización de Pagos
------------------------------

# TDD-0006: Actualización de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir al tesorero actualizar la información de un pago existente en caso de errores de carga o cambios administrativos, manteniendo la integridad de los datos y evitando modificaciones indebidas en pagos ya procesados.

### User Persona

* **Nombre**: Alberto (Tesorero).
* **Necesidad**: Corregir errores en los datos de un pago sin comprometer la trazabilidad ni alterar pagos ya realizados.

### Criterios de Aceptación

* El sistema debe permitir actualizar los datos de un pago solo si su estado es **"PENDING"**.
* El sistema no debe permitir modificar pagos con estado **"PAID"** o **"CANCELED"**.
* El sistema debe validar los datos ingresados (monto, fechas, etc.).
* El sistema debe confirmar la actualización del pago.

---

## Diseño Técnico (RFC)

### Modelo de Datos

La entidad `Payment` mantiene la misma estructura definida previamente:

* `id`: Identificador único.
* `memberId`: Referencia al socio.
* `monto`: Número positivo.
* `mesReferencia`: Número entero (1-12).
* `anioReferencia`: Número entero.
* `fechaVencimiento`: Fecha límite.
* `estado`: Enumeración (`PENDING`, `PAID`, `CANCELED`).
* `fechaPago`: Fecha opcional.

---

### Contrato de API (@alentapp/shared)

* **Endpoint**: `PUT /api/v1/payments/:id`
* **Request Body (UpdatePaymentRequest):**

```ts id="y4x2kp"
{
    monto?: number;
    fechaVencimiento?: string;
}
```

---

### Componentes de Arquitectura Hexagonal

1. **Domain**:
   Entidad `Payment` con restricción de modificación según estado.

2. **Application**:
   Caso de uso `UpdatePayment`, encargado de validar el estado del pago antes de permitir cambios.

3. **Infrastructure**:

   * Adaptador de salida: Repositorio para persistencia.
   * Adaptador de entrada: `PaymentController`.

---

## Casos de Borde y Errores

| Escenario               | Resultado Esperado                                    | Código HTTP               |
| ----------------------- | ----------------------------------------------------- | ------------------------- |
| Pago inexistente        | Mensaje: "Pago no encontrado"                         | 404 Not Found             |
| Pago en estado PAID     | Mensaje: "No se puede modificar un pago ya realizado" | 400 Bad Request           |
| Pago en estado CANCELED | Mensaje: "No se puede modificar un pago cancelado"    | 400 Bad Request           |
| Datos inválidos         | Mensaje de validación                                 | 400 Bad Request           |
| Error de conexión a DB  | Mensaje: "Error interno, reintente más tarde"         | 500 Internal Server Error |

---

## Plan de Implementación

1. Definir el tipo `UpdatePaymentRequest` en `@alentapp/shared`.
2. Implementar el caso de uso `UpdatePayment`.
3. Validar que el estado del pago sea **PENDING** antes de actualizar.
4. Implementar método `update` en el repositorio.
5. Exponer endpoint en `PaymentController`.
