---

id: 0011
estado: Propuesto
autor: Melissa Braunstein
fecha: 2026-05-03
titulo: Actualización de Pagos
------------------------------

# TDD-0011: Actualización de Pagos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir a los administradores gestionar el ciclo de vida de los pagos, registrando abonos o anulando cargos erróneos sin realizar borrado físico, garantizando la inmutabilidad y trazabilidad financiera.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Actualizar el estado de los pagos a "Paid" o "Canceled" y corregir datos administrativos básicos.

### 1.3. Criterios de Aceptación

* Como administrador, quiero actualizar un pago existente para mantener correcta la información financiera.

- Escenario de éxito: Si el usuario actualiza datos válidos de un pago pendiente, el sistema debe guardar los cambios y notificar al usuario.
- Escenario de éxito: Si el usuario marca un pago pendiente como abonado, el sistema debe actualizar el estado a `Paid`.
- Escenario de fallo: Si el usuario intenta modificar un pago inexistente, el sistema debe cancelar la operación e informar error.
- Escenario de fallo: Si el usuario intenta modificar un pago eliminado, el sistema debe bloquear la operación.
- Escenario de fallo: Si el usuario ingresa un monto inválido, el sistema debe rechazar la actualización.

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Entidad `Payment`:

* `id`: Identificador único universal (UUID).
* `member_id`: Identificador del socio.
* `amount`: Monto decimal positivo.
* `month`: Mes del pago.
* `year`: Año del pago.
* `due_date`: Fecha de vencimiento.
* `payment_day`: Fecha de pago.
* `status`: Estado del pago (`Pending`, `Paid`, `Canceled`).
* `created_at`: Fecha de creación.
* `updated_at`: Fecha de última modificación.

### 2.2. Contrato de API (@alentapp/shared)

#### Endpoint

`PATCH /api/v1/payments/:id`

#### Request Body

```ts
{
  amount?: number;
  due_date?: string;
  status?: "Paid" | "Canceled";
}
```

### 2.3. Esquema de Persistencia

```prisma
model Payment {
  id           String    @id @default(uuid())
  member_id    String
  amount       Decimal
  month        Int
  year         Int
  status       String    @default("Pending")
  due_date     DateTime
  payment_date DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  member       Member    @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `PaymentRepository`
  * `findById(id)`
  * `update(id, data)`
* **Adaptador de Entrada (Delivery)**: `PaymentController`
* **Adaptador de Salida (Infrastructure)**: `PostgresPaymentRepository`

### 3.2. Lógica del Caso de Uso

#### Caso de Uso: `UpdatePaymentUseCase`

1. Recibir `id` del pago.
2. Buscar pago existente.
3. Si no existe, retornar error.
4. Validar Inmutabilidad: Si el estado actual es Paid o Canceled, rechazar edición..
5. Validar request body.
6. Si se actualiza `amount`, verificar que sea mayor a cero.
7. Validar transición de estado permitida:
   * `Pending -> Paid`
   * `Pending -> Canceled`
8. Bloquear cambios desde `Paid` salvo lectura.
9. Persistir cambios.
10. Retornar pago actualizado.

## 4. Casos de Borde y Errores

| Escenario                     | Resultado Esperado            | Código HTTP |
| ----------------------------- | ----------------------------- | ----------- |
| Pago inexistente              | El pago no existe             | 404         |
| Pago ya cancelado               | El pago fue eliminado         | 409         |
| Monto inválido                | Monto inválido                | 400         |
| Request sin campos            | Debe enviar al menos un campo | 400         |
| Transición de estado inválida | Cambio de estado no permitido | 409         |
| ID inválido                   | Formato de ID inválido        | 400         |
| Error de DB                   | Error interno                 | 500         |

## 5. Plan de Implementación

1. Crear tipos compartidos de update en `@alentapp/shared`.
2. Ampliar `PaymentRepository` con `findById` y `update`.
3. Implementar `UpdatePaymentUseCase`.
4. Crear endpoint `PATCH /api/v1/payments/:id`.
5. Validar reglas de transición de estado.

## 6. Observaciones Adicionales

* No se permite modificar `member_id` desde este endpoint.
* Los pagos eliminados y pagados no deben modificarse.
* Un pago abonado debería considerarse cerrado operativamente.
* Solo pagos pendientes pueden cancelarse.
* No se permite eliminación física de pagos.