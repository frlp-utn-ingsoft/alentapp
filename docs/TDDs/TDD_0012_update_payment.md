---
id: "0012"
estado: Propuesto
autor: Hajime
fecha: 2026-05-02
titulo: Actualización de Pago
---

# TDD-0012: Actualización de Pago

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos corregir datos de un pago existente, como el monto, la fecha de vencimiento o la fecha de pago efectivo. La regla de inmutabilidad impide eliminar pagos; la única forma de "cancelar" uno es a través del flujo de baja (TDD-0013), por lo que este TDD se limita a la corrección de datos y al marcado como pagado.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Corregir un monto mal ingresado o registrar la fecha exacta en que un socio efectuó el pago, sin perder el historial previo.

### Criterios de Aceptación

- El sistema debe permitir actualizar uno o varios campos del pago (`amount`, `month`, `year`, `dueDate`, `paymentDate`).
- El sistema debe validar que el pago exista antes de intentar actualizarlo.
- El sistema debe validar que, si se modifica `amount`, el nuevo valor sea mayor a cero.
- El sistema debe validar que, si se modifica `month`, esté entre 1 y 12.
- El sistema **no debe permitir** modificar el `status` desde este endpoint (el cambio de status se gestiona en TDD-0013).
- Si la edición es correcta, debe retornar los datos actualizados del pago.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Todos los campos son opcionales ya que se trata de una actualización parcial.

- Endpoint: `PUT /api/v1/payments/:id`
- Request Body (`UpdatePaymentRequest`):

```ts
{
    amount?: number;
    month?: number;       // 1–12
    year?: number;
    dueDate?: string;     // ISO Date String (YYYY-MM-DD)
    paymentDate?: string; // ISO Date String (YYYY-MM-DD), nullable
}
```

- Response (`PaymentResponse`):

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: "Pending" | "Paid" | "Canceled";
    dueDate: string;
    paymentDate: string | null;
    memberId: string;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Payment` que reutiliza las validaciones de monto positivo y mes en rango.
- **Application**: Caso de uso `UpdatePaymentUseCase` (verifica existencia del pago, valida los campos recibidos y bloquea el cambio de `status`). Puerto: `PaymentRepository` (método `update(id, data)`).
- **Infrastructure**: `PostgresPaymentRepository` (implementación de `update` usando Prisma). `PaymentController` (ruta `PUT /api/v1/payments/:id` que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                        | Código HTTP               |
| -------------------------- | --------------------------------------------------------- | ------------------------- |
| Pago inexistente           | Mensaje: "El pago especificado no existe"                 | 404 Not Found             |
| Monto no positivo          | Mensaje: "El monto debe ser mayor a cero"                 | 400 Bad Request           |
| Mes fuera de rango         | Mensaje: "El mes debe estar entre 1 y 12"                 | 400 Bad Request           |
| Intento de cambiar status  | Mensaje: "El status no puede modificarse desde este endpoint" | 400 Bad Request       |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"             | 500 Internal Server Error |
| Actualización exitosa      | Datos del pago actualizados                               | 200 OK                    |

## Plan de Implementación

1. Definir `UpdatePaymentRequest` en `@alentapp/shared`.
2. Ampliar el `PaymentRepository` con el método `update`.
3. Implementar `UpdatePaymentUseCase` reutilizando las validaciones de la entidad de dominio `Payment`.
4. Crear la ruta `PUT` en el `PaymentController` y enlazarla a la app de Fastify.
5. Consumir el endpoint desde el Frontend y reutilizar el modal de creación para permitir la edición.
6. Agregar tests unitarios del caso de uso y tests de integración del endpoint.