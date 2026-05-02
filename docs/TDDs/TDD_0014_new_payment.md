---

id: 0005
estado: Propuesto
autor: [Abel Di Bella]
fecha: 2026-04-27
titulo: Registro de Nuevos Pagos
--------------------------------

# TDD-0005: Registro de Nuevos Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir al tesorero registrar de forma digital las cuotas mensuales de los socios, evitando el seguimiento manual de deudas y garantizando la integridad de la información financiera desde su creación.

### User Persona

* **Nombre**: Alberto (Tesorero).
* **Necesidad**: Registrar rápidamente las cuotas mensuales de los socios sin cometer errores, evitando duplicaciones que puedan generar inconsistencias en el estado de cuenta.

### Criterios de Aceptación

* El sistema debe validar que no exista un pago previo para el mismo socio, mes y año.
* El sistema debe registrar el pago con estado **"PENDING"** por defecto.
* El sistema debe validar que los datos ingresados sean correctos (montos positivos, fechas válidas).
* Al finalizar, el sistema debe confirmar la creación del pago.

---

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades:

* `id`: Identificador único universal (UUID).
* `memberId`: Referencia al socio.
* `monto`: Número positivo.
* `mesReferencia`: Número entero (1-12).
* `anioReferencia`: Número entero (ej. 2026).
* `fechaVencimiento`: Fecha límite de pago.
* `estado`: Enumeración (`PENDING`, `PAID`, `CANCELED`) con valor por defecto `PENDING`.
* `fechaPago`: Fecha opcional (solo cuando el pago se realiza).

---

### Contrato de API (@alentapp/shared)

* **Endpoint**: `POST /api/v1/payments`
* **Request Body (CreatePaymentRequest):**

```ts id="g7r9df"
{
    memberId: string;
    monto: number;
    mesReferencia: number;
    anioReferencia: number;
    fechaVencimiento: string;
}
```

---

### Componentes de Arquitectura Hexagonal

1. **Domain**:
   Entidad `Payment` y reglas de negocio (no duplicación de pagos).

2. **Application**:
   Caso de uso `CreatePayment`, encargado de validar que no exista un pago para el mismo socio, mes y año antes de crearlo.

3. **Infrastructure**:

   * Adaptador de salida: Implementación del repositorio en base de datos.
   * Adaptador de entrada: `PaymentController` que expone el endpoint HTTP.

---

## Casos de Borde y Errores

| Escenario              | Resultado Esperado                            | Código HTTP               |
| ---------------------- | --------------------------------------------- | ------------------------- |
| Pago duplicado         | Mensaje: "Ya existe un pago para ese período" | 409 Conflict              |
| Monto inválido         | Mensaje: "El monto debe ser mayor a 0"        | 400 Bad Request           |
| Fecha inválida         | Mensaje: "Fecha de vencimiento inválida"      | 400 Bad Request           |
| Error de conexión a DB | Mensaje: "Error interno, reintente más tarde" | 500 Internal Server Error |

---

## Plan de Implementación

1. Definir esquema de persistencia para `Payment` y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto en el Dominio.
3. Implementar el repositorio y el caso de uso `CreatePayment`.
4. Exponer el endpoint en `PaymentController`.
5. Validar duplicación de pagos por socio, mes y año.
