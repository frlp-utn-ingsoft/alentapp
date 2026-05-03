---

id: 0010
estado: Propuesto
autor: Melissa Braunstein
fecha: 2026-05-03
titulo: Registro de Pagos
-------------------------

# TDD-0010: Registro de Pagos

## 1. Contexto de Negocio

### 1.1. Objetivo

Permitir al sistema generar registros de pagos asociados a socios del club, dejando constancia de obligaciones económicas pendientes, y habilitar al administrador a crear pagos manuales en casos excepcionales.

### 1.2. User Persona

* Rol: Administrador
* Necesidad: Visualizar pagos generados, gestionar su estado y crear pagos manuales cuando corresponda.

### 1.3. Criterios de Aceptación

* Como administrador, quiero que el sistema registre pagos para socios para mantener actualizado el estado financiero.

- Escenario de éxito: Si el sistema genera un pago con datos válidos para un socio existente, debe crear el registro en estado `Pending` y notificar el resultado exitoso.
- Escenario de éxito: Si el sistema genera pagos para múltiples socios habilitados en un nuevo período, debe registrar cada pago correspondiente sin duplicados.
- Escenario de éxito: Si el administrador carga manualmente un pago con datos válidos, el sistema debe registrarlo en estado Pending.
- Escenario de fallo: Si el sistema intenta generar un pago para un socio inactivo, debe cancelar la operación para ese socio e informar el error.
- Escenario de fallo: Si ya existe un pago registrado para el mismo socio y período, el sistema debe rechazar la duplicación y conservar el registro original.
- Escenario de fallo: Si el administrador intenta crear manualmente un pago con monto inválido, el sistema debe rechazar la operación.

## 2. Diseño Técnico

### 2.1. Modelo de Dominio

Entidad `Payment`:

* `id`: Identificador único universal (UUID).
* `member_id`: Identificador del socio.
* `amount`: Monto decimal positivo.
* `month`: Mes del pago.
* `year`: Año del pago.
* `due_date`: Fecha de vencimiento.
* `payment_date`: Fecha de pago.
* `status`: Estado del pago (`Pending`, `Paid`, `Canceled`).
* `created_at`: Fecha de creación.
* `updated_at`: Fecha de última modificación.

### 2.2. Contrato de API (@alentapp/shared)

#### Crear pago

`POST /api/v1/payments`

```ts
{
  member_id: string;
  amount: number;
  due_date: string;
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
  * `create(data)`
* **Adaptador de Entrada (Delivery)**: `PaymentController`
* **Adaptador de Salida (Infrastructure)**: `PostgresPaymentRepository`

### 3.2. Lógica del Caso de Uso

#### Caso de Uso: `NewPaymentUseCase`

1. Validar datos de entrada.
2. Verificar existencia del socio.
3. Validar que `amount > 0`.
4. Verifica que el due_date cumplan con el formato ISO 8601.
5. Extraer month y date de due_date.
6. Crear pago con estado inicial `Pending`.
7. Persistir registro.
8. Retornar pago creado.

## 4. Casos de Borde y Errores

| Escenario                  | Resultado Esperado                   | Código HTTP |
| -------------------------- | ------------------------------------ | ----------- |
| Socio dado de baja          |  No se puede generar el pago porque el socio se encuentra dado de baja.                  | 409         |
| Monto menor o igual a cero | Monto inválido                       | 400         |
| Error de DB                | Error interno                        | 500         |

## 5. Plan de Implementación

1. Crear entidad `Payment` en esquema Prisma.
2. Ejecutar migración.
3. Crear tipos compartidos en `@alentapp/shared`.
4. Implementar `PaymentRepository`.
5. Implementar `NewPaymentUseCase`.
6. Implementar `UpdatePaymentStatusUseCase`.
7. Crear endpoints REST.
8. Integrar frontend administrativo.

## 6. Observaciones Adicionales

* El historial financiero debe mantenerse íntegro.
* Los pagos nuevos deben crearse en estado `Pending`.
* El year y month son extraidos de due_date

