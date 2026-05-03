---
autor: [Valentina Pértile de la Vega]
fecha: [2026-05-01]
titulo: Update Payment
---
 
# TDD-[0005]: Actualizar Payment
 
## Contexto de Negocio (PRD)
 
### Objetivo
Permitir actualizar el estado de un pago existente.
 
### User Persona
 
- **Nombre**: Administrativo del club
- **Necesidad**: Modificar el estado de un pago.

### Criterios de Aceptación
- El sistema debe permitir actualizar el campo `status`.
- Los valores permitidos son: `Pending`, `Paid`, `Canceled`.
- El pago debe existir para poder actualizarlo.
- (Recomendado) No se permite cambiar de `Canceled` a otro estado.


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
  member_id: string;
}
```

### Componentes de Arquitectura Hexagonal
 
- **Domain**: Entidad `Payment`. Hay que validar que estados estan permitidos, es decir, que reglas de transición se aceptan. Las mismas son:
 1. No se permite transicionar desde `Canceled` a ningún otro estado.
 2. Cuando el estado transiciona a `Paid`, el dominio setea automáticamente `payment_date` con el tiempo actual. El campo no lo modifica el usuario.

- **Application**: Caso de uso `UpdatePayment`. Puerto de salida `PaymentRepository`.

- **Infrastructure**: `PaymentController` (PATCH). `PrismaPaymentRepository`.

## Casos de Borde y Errores
 
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| `id` inexistente | Error: pago no encontrado | 404 Not Found |
| `status` inválido | Error de validación | 400 Bad Request |
| intento de cambiar desde `Canceled` | Error de regla de negocio | 400 Bad Request |
| Transición a `Paid` | `payment_date` se setea automáticamente con el timestamp actual | 200 OK |

 
## Plan de Implementación
 
1. Definir DTO `UpdatePaymentDto` en `@alentapp/shared`
2. Implementar caso de uso `UpdatePayment` en Application
3. Validar reglas de transicion de estados (no permitir cambio desde `Canceled`; setear `payment_date` automáticamente al transicionar a `Paid`)
4. Implementar método `update` en `PrismaPaymentRepository`
5. Implementar endpoint `PATCH /api/v1/payments/:id`
