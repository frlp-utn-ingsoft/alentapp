---
id: 1001
estado: Pendiente
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Registro de Pago Mensual (Crear)
---

# TDD-1001: Registro de Pago Mensual (Crear)

## Contexto de Negocio (PRD)

### Objetivo
Gestionar el registro inicial de los pagos mensuales de los socios en el sistema para mantener su cuenta activa.

### User Personas

**Socio**
* **Necesidad**: Espera poder abonar su cuota mensual para mantener su cuenta activa.

**Tesorero / Administrativo**
* **Necesidad**: Necesita registrar nuevos pagos en el sistema.

### Criterios de Aceptación
* El sistema debe validar que los campos requeridos como `amount`, `month` y `year` estén presentes.
* El estado por defecto del pago al crearse debe ser 'Pending'.
* Al finalizar, el sistema debe guardar el registro en la base de datos PostgreSQL.

## Diseño Técnico (RFC)

### Modelo de Datos
Se utiliza la entidad `Payment`:
* `id`: String @id @default(uuid()) @db.Uuid.
* `amount`: Float.
* `month`: Int.
* `year`: Int.
* `status`: PaymentStatus @default(Pending).
* `due_date`: DateTime @db.Date.
* `payment_date`: DateTime?.
* `member_id`: String @db.Uuid.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `POST /api/v1/payment`
* **Request Body** (CreatePaymentRequest):
```ts
{
    amount: number;      // Monto del pago, debe ser mayor a cero
    month: number;       // Mes del pago (1-12)
    year: number;        // Año del pago
    due_date: string;    // ISO 8601 (YYYY-MM-DD)
    member_id: string;   // UUID del socio
}
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Entidad `Payment` y tipos `PaymentStatus`.
* **Application**: Caso de Uso `CreatePayment`. Puerto de salida `PaymentRepository.save(payment: Payment)`.
* **Infrastructure**: Implementación del repositorio con Prisma y `PaymentController` para la ruta.

## Casos de Borde y Errores
| Escenario                        | Resultado Esperado                                                        | Código HTTP     |
| -------------------------------- | ------------------------------------------------------------------------- | --------------- |
| Datos faltantes                  | El sistema rechaza la petición por falta de `amount`, `month` o `year`    | 400 Bad Request |
| `member_id` inexistente          | Mensaje: "No existe un socio con ese ID"                                  | 404 Not Found   |
| `amount` negativo o igual a cero | Mensaje: "El monto debe ser mayor a cero"                                 | 400 Bad Request |
| `month` fuera de rango (< 1 o > 12) | Mensaje: "El mes debe estar entre 1 y 12"                              | 400 Bad Request |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"                             | 500 Internal Server Error |

## Plan de Implementación
1. Implementar esquema en Prisma y correr migraciones.
2. Definir DTOs en `@alentapp/shared`.
3. Implementar `PaymentRepository` y el caso de uso `CreatePayment`.
4. Conectar controlador al endpoint POST.