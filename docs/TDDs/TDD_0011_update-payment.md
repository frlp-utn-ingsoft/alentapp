---
id: 0011
estado: Propuesto
autor: Melissa Braunstein
fecha: 2026-05-15
titulo: Actualización de Pagos
---

# TDD-0011: Actualización de Pagos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir al administrador gestionar el ciclo de vida de los pagos creados en el TDD-0010, registrando abonos y corrigiendo datos administrativos básicos mientras el pago se encuentre en estado `Pending`. La cancelación de pagos se documenta en el TDD-0015.

Este TDD define dos operaciones separadas semánticamente:

* **Registrar cobro**: marcar un pago como `Paid`. Operación idempotente.
* **Editar datos administrativos**: corregir `amount` y/o `due_date` mientras el pago siga en `Pending`.

### 1.2. User Persona

* **Rol**: Administrador
* **Necesidad**: Registrar cuándo un socio efectivamente abona, y corregir datos administrativos básicos (`amount`, `due_date`) cuando sea necesario, mientras el pago se mantenga pendiente.

### 1.3. Criterios de Aceptación

* Como administrador, quiero registrar el cobro de un pago para mantener correcta la información financiera.
* Como administrador, quiero corregir los datos de un pago pendiente para subsanar errores administrativos.

#### Registrar cobro (`PATCH /payments/:id/pay`)

- Escenario de éxito: Si el administrador registra el cobro de un pago `Pending`, el sistema debe transicionarlo a `Paid` y registrar `payment_date` con la fecha actual.
- Escenario de éxito (idempotencia): Si el administrador registra el cobro de un pago que ya está en `Paid`, el sistema debe responder 200 OK devolviendo el pago tal cual está, sin modificar `payment_date` ni generar ningún efecto colateral.
- Escenario de fallo: Si el administrador intenta registrar el cobro de un pago `Canceled`, el sistema debe rechazar la operación.
- Escenario de fallo: Si el pago no existe, el sistema debe rechazar la operación.

#### Editar datos (`PATCH /payments/:id`)

- Escenario de éxito: Si el administrador modifica `amount` y/o `due_date` de un pago `Pending` con datos válidos, el sistema debe persistir los cambios. Si cambia `due_date`, el sistema recalcula `month` y `year`.
- Escenario de fallo: Si el administrador intenta editar un pago `Paid` o `Canceled`, el sistema debe rechazar la operación.
- Escenario de fallo: Si el administrador envía un monto inválido (menor o igual a cero), el sistema debe rechazar la actualización.
- Escenario de fallo: Si el administrador envía una `due_date` mal formada, el sistema debe rechazar la actualización.
- Escenario de fallo: Si el administrador envía una `due_date` que no es estrictamente posterior al día actual, el sistema debe rechazar la actualización.
- Escenario de fallo: Si el request no contiene ningún campo a actualizar, el sistema debe rechazar la operación.
- Escenario de fallo: Si la nueva `due_date` produce un período (`month`/`year`) que ya existe activo para ese socio (en otro pago distinto al que se está editando), el sistema debe rechazar la operación.

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Se utiliza la entidad `Payment` definida en el TDD-0010. No se redefine acá para evitar duplicación.

### 2.2. Contrato de API (@alentapp/shared)

#### Registrar cobro

`PATCH /api/v1/payments/:id/pay`

**Request Body:** vacío. La intención queda expresada en la URL.

**Response (200 OK):** El pago completo, con `status = "Paid"` y `payment_date` seteado.

```ts
{
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  due_date: string;
  payment_date: string;
  status: "Paid";
  created_at: string;
  updated_at: string;
  canceled_at: null;
}
```

#### Editar datos administrativos

`PATCH /api/v1/payments/:id`

**Request Body:** (al menos un campo es obligatorio)

```ts
{
  amount?: number;
  due_date?: string;
}
```

**Response (200 OK):** El pago actualizado completo.


### 2.3. Esquema de Persistencia

Se utiliza el modelo Prisma definido en el TDD-0010.

## 3. Arquitectura y Flujo

### 3.1. Componentes de Arquitectura Hexagonal

* **Puerto (Domain)**: `PaymentRepository`
  * `findById(id)`
  * `update(id, data)`
  * `markAsPaid(id, payment_date)`
  * `existsActiveByMemberAndPeriod(member_id, month, year, excluding_payment_id?)`
* **Adaptador de Entrada (Delivery)**: `PaymentController` — expone los endpoints `PATCH /payments/:id/pay` y `PATCH /payments/:id`.
* **Adaptador de Salida (Infrastructure)**: `PostgresPaymentRepository`
* **Dependencia adicional**: `Clock` — abstracción para obtener la fecha/hora actual, inyectada en los casos de uso para facilitar testing.

### 3.2. Lógica del Caso de Uso

#### Caso de Uso: `MarkPaymentAsPaidUseCase`

1. Recibir `id` del pago.
2. Validar que `id` tenga formato UUID válido.
3. Buscar pago existente por `id`. Si no existe, retornar error 404.
4. **Aplicar idempotencia**:
   * Si el pago está en `Paid`: retornar el pago tal cual, con 200 OK. No re-setear `payment_date`, no actualizar `updated_at`, no generar logs ni efectos colaterales.
   * Si el pago está en `Canceled`: rechazar con error 409.
   * Si el pago está en `Pending`: continuar con el flujo.
5. Setear `status = "Paid"` y `payment_date = Clock.now()`.
6. Persistir cambios usando una transacción que vuelva a verificar el estado actual del pago antes de actualizar (defensa contra concurrencia, ver sección 3.3).
7. Retornar el pago actualizado.

#### Caso de Uso: `UpdatePaymentUseCase`

1. Recibir `id` del pago y los campos a actualizar.
2. Validar que `id` tenga formato UUID válido.
3. Validar que el request body tenga al menos un campo (`amount` o `due_date`).
4. Buscar pago existente por `id`. Si no existe, retornar error 404.
5. **Validar inmutabilidad**: si el estado actual es `Paid` o `Canceled`, rechazar la operación con 409.
6. Validar campos individualmente:
   * Si viene `amount`: debe ser mayor a cero.
   * Si viene `due_date`: debe cumplir formato ISO 8601 y ser estrictamente posterior al día actual (`Clock.now()`).
7. Si se actualiza `due_date`, recalcular `month` y `year`. Verificar que el nuevo período no choque con otro pago activo (`Pending` o `Paid`) del mismo socio, excluyendo el pago que se está editando (`existsActiveByMemberAndPeriod` con `excluding_payment_id`).
8. Persistir cambios.
9. Retornar pago actualizado.

### 3.3. Idempotencia y Concurrencia

La entidad Payment es un caso paradigmático del manejo de idempotencia y estados. El diseño la considera explícitamente.

#### Idempotencia en el cobro

El endpoint `PATCH /payments/:id/pay` es **idempotente por naturaleza**: ejecutarlo N veces produce el mismo estado final (`status = Paid` con un `payment_date` único). Esto resuelve los siguientes escenarios reales:

* **Doble-click del administrador**: si el operador hace click dos veces antes de que llegue la primera respuesta, ambas requests responden 200 OK con el mismo pago. No se duplica ningún registro ni se modifica `payment_date`.
* **Reintento por timeout de red**: si el cliente no recibió la primera respuesta y reintenta, el comportamiento es idéntico.
* **Reintento automático del frontend ante errores transitorios**: si el frontend implementa retry, no hay riesgo de "cobrar dos veces" desde la perspectiva del modelo.

La clave del diseño es que **`payment_date` se setea una sola vez**, en la primera transición exitosa de `Pending → Paid`. Las invocaciones posteriores ven el pago ya en `Paid` y retornan sin tocar el registro. Esto preserva la trazabilidad del momento real del cobro.

#### Manejo del vencimiento sin borrado

Cuando un pago vence sin ser abonado, el sistema **no elimina** ni modifica los datos originales. El job del TDD-0018 transiciona el pago a `Canceled` y setea `canceled_at`, pero conserva `amount`, `due_date`, `month`, `year`, etc. Esto permite:

* Auditoría completa: se puede reconstruir qué se había cargado, cuándo venció y cuándo fue cancelado.
* Reportes históricos de morosidad.
* Distinguir cancelaciones manuales (admin) de automáticas (job) comparando `canceled_at` con `due_date`.

#### Concurrencia entre admin y job

Dos flujos pueden intentar modificar un mismo pago en paralelo:

1. Admin cobrando vía `PATCH /payments/:id/pay`.
2. Job del TDD-0018 ejecutando `CancelPaymentUseCase`.

La estrategia adoptada es **transacción con relectura del estado**:

1. El caso de uso, antes de persistir, abre una transacción.
2. Dentro de la transacción se vuelve a leer el estado del pago.
3. Si el estado ya no es `Pending`, la operación se aborta:
   * En `MarkPaymentAsPaidUseCase`: si encontró `Paid`, devuelve idempotentemente; si encontró `Canceled`, devuelve 409.
   * En `UpdatePaymentUseCase`: si encontró estado terminal, devuelve 409.
4. Si el estado sigue siendo `Pending`, se aplica la actualización y se commitea la transacción.

Esto garantiza que entre dos requests concurrentes, **solo una efectivamente modifica el pago**, y la otra responde de forma consistente con el estado final.

#### Inyección de Clock

Tanto `MarkPaymentAsPaidUseCase` como `UpdatePaymentUseCase` reciben una dependencia `Clock` por inyección. En producción, `Clock.now()` retorna la hora del sistema; en tests, se inyecta un mock que retorna una fecha fija. Esto permite:

* Tests determinísticos para validar que `payment_date` se setea correctamente.
* Tests determinísticos para validar la regla de `due_date` futura en edición.

## 4. Casos de Borde y Errores

### 4.1. `PATCH /payments/:id/pay`

| Escenario                                                   | Resultado Esperado                                      | Código HTTP |
| ----------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| Pago inexistente                                            | El pago no existe                                       | 404         |
| Pago en `Pending`                                           | Se cobra exitosamente, `payment_date` seteado           | 200         |
| Pago ya en `Paid` (idempotencia)                            | Se retorna el pago sin modificar                        | 200         |
| Pago en `Canceled`                                          | No se puede cobrar un pago cancelado                    | 409         |
| ID con formato inválido                                     | Formato de ID inválido                                  | 400         |
| Error de DB                                                 | Error interno                                           | 500         |

### 4.2. `PATCH /payments/:id`

| Escenario                                                   | Resultado Esperado                                      | Código HTTP |
| ----------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| Pago inexistente                                            | El pago no existe                                       | 404         |
| Pago ya pagado                                              | El pago ya fue abonado y no es editable                 | 409         |
| Pago ya cancelado                                           | El pago fue cancelado y no es editable                  | 409         |
| Monto inválido                                              | Monto inválido                                          | 400         |
| `due_date` con formato inválido                             | Formato de fecha inválido                               | 400         |
| `due_date` anterior o igual al día actual                   | La fecha de vencimiento debe ser futura                 | 400         |
| Request sin campos                                          | Debe enviar al menos un campo                           | 400         |
| Request incluye `status`                                    | El campo `status` no se acepta en este endpoint         | 400         |
| ID con formato inválido                                     | Formato de ID inválido                                  | 400         |
| Nuevo período ya existe activo en otro pago del socio       | Ya existe un pago activo para ese período               | 409         |
| Error de DB                                                 | Error interno                                           | 500         |

## 5. Plan de Implementación

1. Crear tipos compartidos en `@alentapp/shared` para el response de cobro y para el body de edición.
2. Asegurar que la interfaz `Clock` (definida junto a TDD-0010) esté disponible.
3. Ampliar `PaymentRepository` con `findById`, `update`, `markAsPaid` y `existsActiveByMemberAndPeriod` (con parámetro opcional `excluding_payment_id`).
4. Implementar `MarkPaymentAsPaidUseCase` con manejo de idempotencia y relectura transaccional.
5. Implementar `UpdatePaymentUseCase` con validación de inmutabilidad, validación de `due_date` futura y recálculo de `month`/`year`.
6. Crear endpoints `PATCH /api/v1/payments/:id/pay` y `PATCH /api/v1/payments/:id` en `PaymentController`.
7. Integrar frontend administrativo con acciones "Registrar cobro" y "Editar pago".

## 6. Observaciones Adicionales

* La transición `Pending → Paid` es **idempotente**: invocar el endpoint N veces es equivalente a invocarlo una vez. `payment_date` se setea solo en la primera transición real.
* La transición `Pending → Canceled` se realiza exclusivamente vía `PATCH /payments/:id/cancel` (TDD-0018), no desde estos endpoints.
* Los estados `Paid` y `Canceled` son terminales: una vez alcanzados, no se permiten modificaciones de ningún tipo desde el TDD-0011.
* No existe la transición `Canceled → Paid`. Si un pago vencido fue cancelado por el job y el socio efectivamente pagó, el administrador debe crear un nuevo pago vía TDD-0010 (esto es posible porque la unicidad por período solo aplica a pagos activos).
* `payment_date` se setea automáticamente vía `Clock.now()`. Nunca se acepta desde el cliente.
* `member_id`, `month` y `year` no se modifican directamente. `month` y `year` se recalculan al cambiar `due_date`.
* La regla de `due_date` estrictamente futura aplica tanto en creación (TDD-0010) como en edición.
* La concurrencia entre el endpoint HTTP y el job programado (TDD-0018) se resuelve mediante relectura transaccional del estado antes de persistir cualquier cambio.
* La inyección de `Clock` permite tests determinísticos sobre los timestamps generados por el sistema y sobre la regla de fecha futura.
