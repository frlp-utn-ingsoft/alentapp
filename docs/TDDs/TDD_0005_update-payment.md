---
autor: Valentina Pértile de la Vega
fecha: 2026-05-01
titulo: Update and Delete Payment
---
 
# TDD-0005: Actualizar (y eliminar) Payment
 
## Contexto de Negocio (PRD)
 
### Objetivo
Permitir 2 operaciones sobre un pago existente: 
  - Actualizar el `Status` de un pago (De `Pending` a `Paid`, de `Pending` a `Canceled`, por mencionar algunas) 
  - Eliminar LÓGICAMENTE un pago, lo que equivale a pasar `status` a `Canceled` y registrar la fecha de cancelación.

  
### User Persona
 
- **Nombre**: Administrativo del club
- **Necesidad**: Modificar el estado de un pago ya sea para mostrar un cambio en el sistema, o borrarlo.

### Criterios de Aceptación
- El sistema debe permitir actualizar el campo `status`.
- Los valores permitidos son: `Pending`, `Paid`, `Canceled`.
- El pago debe existir para poder actualizarlo.
- No se permite cambiar de `Canceled` a otro estado.
- Cuando el `status` transiciona a `Paid`, el sistema setea automáticamente `payment_date` con el timestamp actual; el usuario no puede modificarlo.
- Cuando el `status` transiciona a `Canceled` vía `PATCH`, el sistema setea automáticamente `cancelled_at` con el timestamp actual.
- Si el pago ya está en el estado solicitado, la operación es idempotente: no genera cambios y retorna el pago sin modificaciones.


## Diseño Técnico (RFC)
 
### Modelo de Datos
 
Entidad existente `PAYMENT`:
 
- `id`: uuid (PK)
- `amount`: float
- `year`: int
- `month`: int
- `status`: string (Pending, Paid y Canceled)
- `due_date`: date
- `payment_date`: datetime (nullable)
- `cancelled_at`: datetime (nullable) 
- `member_id`: uuid (FK → MEMBER)

### Contrato de API (@alentapp/shared)
 
- **Endpoint**: `PATCH /api/v1/payments/:id`
- **Request Body**:
```ts
{
  status: "Pending" | "Paid" | "Canceled";
}
```
- **Response:** `200 OK`
- **Response Body**:
```ts
{
  id: string;
  amount: number;
  month: number;
  year: number;
  status: "Pending" | "Paid" | "Canceled";
  due_date: string;
  payment_date: string | null;
  cancelled_at: string | null;
  member_id: string;
}
```

### Componentes de Arquitectura Hexagonal
 
- **Domain**: Entidad `Payment`. Método `transitionTo(newStatus: PaymentStatus): void` que encapsula las validaciones de transición y el seteo automático de `payment_date` y `cancelled_at`.

- **Application**: 
  - Caso de uso `UpdatePayment`.
  - Puerto de salida `PaymentRepository`.

- **Infrastructure**: `PaymentController` (PATCH). `PrismaPaymentRepository`.

## Casos de Borde y Errores
 
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| `id` inexistente | Error: pago no encontrado | 404 Not Found |
| `status` inválido | Error: valor de status no permitido | 400 Bad Request |
| Intento de cambiar desde `Canceled` | Error: no se puede cambiar desde un estado terminal | 400 Bad Request |
| Transición desde `Paid` a `Pending` | Error de negocio: transición no permitida | 400 Bad Request |
| Transición a `Paid` (desde `Pending`) | `payment_date` se setea con el timestamp actual; `cancelled_at` permanece `null` | 200 OK |
| Transición a `Canceled` (desde `Pending` o `Paid`) | `cancelled_at` se setea con el timestamp actual | 200 OK |

 
## Plan de Implementación
 
### 1. Shared (`@alentapp/shared`)
- Definir el DTO `UpdatePaymentDto` con validación de `status` como (`Pending | Paid | Canceled`).
- Actualizar el tipo `PaymentResponseDto` para incluir el campo `cancelled_at: string | null`.

### 2. Domain — Entidad `Payment`
- Agregar el campo `cancelled_at: Date | null` a la entidad.
- Implementar el método `transitionTo(newStatus: PaymentStatus): void`:
  - Validar que la transición es permitida según la tabla de reglas (lanzar `InvalidStatusTransitionException` si no).
  - Si `newStatus === "Paid"`: setear `payment_date = new Date()`
  - Si `newStatus === "Canceled"`: setear `cancelled_at = new Date()`
  - Actualizar `status`.

### 3. Application — Caso de uso `UpdatePayment`
- Recibir el comando con `id` y `status`.
- Buscar el pago con `PaymentRepository.findById(id)`. Si no existe, lanzar `PaymentNotFoundException`.
- Invocar `payment.transitionTo(status)` 
- Persistir el pago actualizado con `PaymentRepository.update(payment)`.
- Retornar el `Payment` actualizado.

### 4. Infrastructure — `PrismaPaymentRepository`
- Implementar el método `findById(id: string): Promise<Payment | null>` usando `prisma.payment.findUnique`.
- Implementar el método `update(payment: Payment): Promise<Payment>` usando `prisma.payment.update`, incluyendo `cancelled_at` en el payload.

### 5. Infrastructure — `PaymentController`
- Implementar el endpoint `PATCH /api/v1/payments/:id`:
- Validar el body con `UpdatePaymentDto`.
- Invocar el caso de uso `UpdatePayment`.
- Retornar `200 OK` con el `PaymentResponseDto`.
