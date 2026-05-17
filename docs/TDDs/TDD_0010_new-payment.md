---
id: 0010
estado: Pendiente
autor: Ernesto Ardenghi
fecha: 2026-05-02
titulo: Alta de Pagos
---

# TDD-0010: Registro de nuevos Pagos (Payment)

## Contexto de Negocio (PRD)

### Objetivo

Permitir al personal administrativo generar un nuevo registro de pago (cuota) asociado a un socio, asegurando la validez de los datos contables y estableciendo el estado inicial como "Pending".

### User Persona

Nombre: Anastasia (Tesorera/Administrativa).
Necesidad: Dar de alta cuotas mensuales o anuales de forma rápida y estructurada. Requiere que el sistema valide automáticamente la existencia del socio y la coherencia de fechas/montos para evitar errores en tesorería.

### Criterios de Aceptación

- El sistema debe validar que el `member_id` corresponda a un socio existente.
- El `amount` debe ser numérico y estrictamente mayor a 0.
- El `month` debe estar entre 1 y 12, y el `year` debe ser un entero válido.
- Por defecto, el `status` se establece en "Pending" y `payment_date` queda en `null`.
- **Los campos `created_at` y `updated_at` se generan automáticamente al persistir el registro.**
- Al finalizar, el sistema retorna 201 Created con el objeto generado y limpia el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades y restricciones:

| Campo          | Tipo      | Descripción                           | Restricciones                                          |
| -------------- | --------- | ------------------------------------- | ------------------------------------------------------ |
| `id`           | UUID      | Identificador único universal         | Primary Key                                            |
| `amount`       | Float     | Monto de la cuota/pago                | > 0, numérico                                          |
| `month`        | Int       | Mes del pago (1-12)                   | 1 ≤ month ≤ 12                                         |
| `year`         | Int       | Año del pago                          | 1900 ≤ year ≤ 2100                                     |
| `status`       | Enum      | Estado del pago                       | `Pending` \| `Paid` \| `Canceled` (Default: `Pending`) |
| `due_date`     | Date      | Fecha de vencimiento                  | Requerido                                              |
| `payment_date` | DateTime? | Fecha real de pago (nullable)         | Nullable                                               |
| `member_id`    | UUID      | FK hacia Member                       | Requerido, debe existir                                |
| `created_at`   | DateTime  | **Fecha de creación del registro**    | Auto-generado (`@default(now())`)                      |
| `updated_at`   | DateTime  | **Fecha de última actualización**     | Auto-actualizado (`@updatedAt`)                        |
| `deleted_at`   | DateTime? | Fecha de borrado lógico (Soft Delete) | Nullable                                               |

> **Nota técnica**: Los campos `created_at` y `updated_at` son gestionados automáticamente por Prisma mediante los decorators `@default(now())` y `@updatedAt`. No requieren ser enviados en el request.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido:

- Endpoint: `POST /api/v1/pagos`
- Request Body (CreatePaymentRequest):

```ts
{
    member_id: string;
    amount: number;
    month: number;
    year: number;
    due_date: string;
}
```

- Response: 201 Created
- Response Body:

```
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: "Pending" | "Paid" | "Canceled";
    due_date: string;
    payment_date: string;
    member_id: string;
    created_at: string;    // Nuevo: ISO 8601 datetime
    updated_at: string;    // Nuevo: ISO 8601 datetime
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interface en el Dominio).
2. Caso de Uso: CreatePayment (Valida socio, reglas de negocio y persiste).
3. Adaptador de Salida: DB Persistence Adapter (Implementación real en BD).
4. Adaptador de Entrada: PaymentController.

## Casos de Borde y Errores

| Escenario                                                           | Resultado Esperado                                           | Código HTTP               |
| ------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `member_id` no existe en BBDD                                       | Mensaje: "Error: El socio especificado no existe"            | 404 Not Found             |
| `amount` <= 0                                                       | Mensaje: "Error: El monto debe ser mayor a cero"             | 400 Bad Request           |
| `amount` no numérico                                                | Mensaje: "Error: El monto debe ser un número"                | 400 Bad Request           |
| `month` fuera de rango (1-12)                                       | Mensaje: "Error: Mes inválido. Debe estar entre 1 y 12"      | 400 Bad Request           |
| `year` fuera de rango (ej. 2026)                                    | Mensaje: "Error: Año inválido. Debe estar entre 1900 y 2100" | 400 Bad Request           |
| Campos requeridos vacíos (amount, month, year, due_date, member_id) | Mensaje: "Error: Campos requeridos vacíos"                   | 400 Bad Request           |
| Error de conexión a DB                                              | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia para `Payment` y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto `PaymentRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `CreatePayment`.
4. Crear componente React para el formulario y conectar con el endpoint del backend.

## Consideraciones para el frontend

1. Ordenamiento: Utilizar created_at como criterio de orden por defecto para mostrar los pagos (ej: ORDER BY created_at DESC para mostrar los más recientes primero).
2. Formulario: No incluir campos para created_at ni updated_at en el formulario de creación; son gestionados por el backend.
3. Listado: Si se requiere mostrar la fecha de creación al usuario, formatear created_at según la localidad (ej: "02/05/2026 14:30").
