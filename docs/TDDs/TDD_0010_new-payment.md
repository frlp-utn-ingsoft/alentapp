---
id: 0010
estado: Propuesto
autor: Melissa Braunstein
fecha: 2026-05-15
titulo: Registro de Pagos
---

# TDD-0010: Registro de Pagos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir al administrador registrar manualmente pagos asociados a socios activos del club, dejando constancia de obligaciones económicas pendientes. Todo pago se crea siempre en estado `Pendiente` y representa una (1) cuota del socio: no se permiten registros parciales ni fiados. La gestión del ciclo de vida posterior se documenta en TDD-0011 (actualización y cobro) y TDD-0018 (cancelación).

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Registrar pagos manuales de socios para mantener actualizado el estado financiero del club.

### 1.3. Criterios de Aceptación

* Como administrador, quiero registrar pagos de socios para mantener actualizado el estado financiero.

- Escenario de éxito: Si el administrador carga un pago con datos válidos para un socio activo, el sistema debe crear el registro en estado `Pendiente` con `payment_date` y `canceled_at` en `null`.
- Escenario de fallo: Si el administrador intenta crear un pago para un socio supendido, el sistema debe rechazar la operación.
- Escenario de fallo: Si el administrador intenta crear un pago con monto inválido (menor o igual a cero), el sistema debe rechazar la operación.
- Escenario de fallo: Si el administrador intenta crear un pago con `due_date` mal formada (no ISO 8601), el sistema debe rechazar la operación.
- Escenario de fallo: Si el administrador intenta crear un pago cuya `due_date` no sea estrictamente posterior al día actual, el sistema debe rechazar la operación.
- Escenario de fallo: Si ya existe un pago activo (`Pendiente` o `Pagado`) para el mismo socio y período, el sistema debe rechazar la duplicación.

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Entidad `Payment`:

* `id`: Identificador único universal (UUID).
* `member_id`: Identificador del socio.
* `amount`: Monto decimal positivo.
* `month`: Mes del pago (derivado de `due_date`). Valor entre 1 y 12.
* `year`: Año del pago (derivado de `due_date`).
* `due_date`: Fecha de vencimiento (ISO 8601). Debe ser estrictamente posterior al día actual.
* `payment_date`: Fecha en la que se registró el pago efectivo. Inicialmente `null`.
* `status`: Estado del pago (`Pendiente`, `Pagado`, `Cancelado`). En la creación es siempre `Pendiente`.
* `created_at`: Fecha de creación.
* `updated_at`: Fecha de última modificación.
* `canceled_at`: Fecha de cancelación. Inicialmente `null`.

### 2.2. Contrato de API (@alentapp/shared)

#### Crear pago

`POST /api/v1/payments`

**Request Body:**

```ts
{
  member_id: string;
  amount: number;
  due_date: string;
}
```

**Response (201 Created):**

```ts
  type PaymentResponseDTO = {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  due_date: string;
  payment_date: null;
  status: "Pendiente";
  created_at: string;
  updated_at: string;
  canceled_at: null;
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
  status       String    @default("Pendiente")
  due_date     DateTime
  payment_date DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
  canceled_at  DateTime?

  member       Member    @relation(fields: [member_id], references: [id])
}
```

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `PaymentRepository`
  * `create(data)`
  * `existsActiveByMemberAndPeriod(member_id, month, year, excluding_payment_id?)`
* **Adaptador de Entrada (Delivery)**: `PaymentController`
* **Adaptador de Salida (Infrastructure)**: `PostgresPaymentRepository`
* **Dependencia adicional**: `Clock` — abstracción para obtener la fecha/hora actual, inyectada en el caso de uso para facilitar testing.

### 3.2. Lógica del Caso de Uso

#### Caso de Uso: `NewPaymentUseCase`

1. Validar formato del request body (tipos y campos requeridos).
2. Validar que `member_id` tenga formato UUID válido.
3. Validar que `due_date` cumpla con el formato ISO 8601.
4. Validar que `due_date` sea estrictamente posterior al día actual (`Clock.now()`).
5. Validar que `amount > 0`.
6. Verificar existencia del socio. Si no existe, retornar error.
7. Verificar que el socio se encuentre activo (`account_status = Activo` o `Moroso`). Si está `Suspendido`, rechazar la operación.
8. Extraer `month` y `year` a partir de `due_date`.
9. Verificar que no exista otro pago activo (`Pendiente` o `Pagado`) para el mismo `member_id`, `month` y `year`. Los pagos en `Cancelado` no bloquean la creación.
10. Crear el pago con `status = Pendiente`, `payment_date = null` y `canceled_at = null`.
11. Persistir registro.
12. Retornar pago creado.

## 4. Casos de Borde y Errores

| Escenario                                          | Resultado Esperado                                     | Código HTTP |
| -------------------------------------------------- | ------------------------------------------------------ | ----------- |
| Socio inexistente                                  | El socio no existe                                     | 404         |
| Socio inactivo                                     | No se puede generar el pago para un socio inactivo     | 409         |
| Pago duplicado activo (mismo socio + período)      | Ya existe un pago activo para ese socio en ese período | 409         |
| Monto menor o igual a cero                         | Monto inválido                                         | 400         |
| `due_date` con formato inválido                    | Formato de fecha inválido                              | 400         |
| `due_date` anterior o igual al día actual          | La fecha de vencimiento debe ser futura                | 400         |
| `member_id` con formato inválido                   | Formato de ID inválido                                 | 400         |
| Request sin campos obligatorios                    | Faltan campos requeridos                               | 400         |
| Error de DB                                        | Error interno                                          | 500         |

## 5. Plan de Implementación

1. Crear modelo `Payment` en el esquema Prisma y ejecutar migración.
2. Crear tipos compartidos en `@alentapp/shared` para el request y response de creación.
3. Definir la interfaz `Clock` (compartida con TDD-0011 y TDD-0018).
4. Implementar `PaymentRepository` con `create` y `existsActiveByMemberAndPeriod`.
5. Implementar `NewPaymentUseCase`.
6. Crear endpoint `POST /api/v1/payments` en `PaymentController`.
7. Integrar frontend administrativo.

## 6. Observaciones Adicionales

* Todo pago creado equivale a una (1) cuota del socio. No se permiten registros parciales ni fiados. 
* Todo pago nuevo se crea en estado `Pendiente`. El status no se acepta desde el cliente.
* `due_date` debe ser estrictamente posterior al día actual: no se permite cargar pagos retroactivos.
* `payment_date` se inicializa en `null` y solo se setea al transicionar a `Pagado` (ver TDD-0011).
* `canceled_at` se inicializa en `null` y solo se setea al transicionar a `Cancelado` (ver TDD-0018).
* `month` y `year` se derivan de `due_date`.
* No se permite el borrado físico de pagos.
* **Unicidad por período activo**: solo se bloquea la creación si existe un pago `Pendiente` o `Pagado` para el mismo socio y período. Los pagos `Cancelado` no cuentan, lo que permite re-crear un pago para un período cuyo registro previo fue cancelado (por error administrativo o por vencimiento via job).
* La actualización y cobro de pagos se documenta en TDD-0011.
* La cancelación de pagos (manual y automática vía job) se documenta en TDD-0018.
