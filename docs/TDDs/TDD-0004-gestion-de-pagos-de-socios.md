---
id: 0004
estado: Pendiente
autor: [Nombre]
fecha: 2026-05-02
titulo: Gestión de Pagos de Socios
---

# TDD-0004: Gestión de Pagos de Socios

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos registrar, consultar y gestionar los pagos realizados por los socios de la aplicación, asegurando la trazabilidad de cada operación económica y evitando la pérdida de información histórica.

El sistema debe reemplazar el control manual de pagos, permitiendo identificar qué socio abonó, a qué período corresponde el pago, cuál es el monto, cuál es la fecha de vencimiento y si el pago se encuentra pendiente, abonado o cancelado.

A diferencia de otras entidades del sistema, los pagos no deben eliminarse físicamente de la base de datos, ya que representan movimientos económicos que requieren trazabilidad. En caso de anulación, el pago deberá cambiar su estado a `Canceled`.

### User Persona

*   **Nombre**: Alberto
*   **Rol**: Tesorero/Administrativo
*   **Necesidad**: Registrar y controlar los pagos de los socios de manera rápida y confiable. Necesita saber qué pagos están pendientes, cuáles fueron abonados y cuáles fueron cancelados, evitando errores contables o pérdida de información histórica.

### Criterios de Aceptación

*   El sistema debe permitir registrar un pago asociado a un socio existente.
*   El sistema debe validar que el socio exista antes de crear un pago.
*   El sistema debe registrar el monto, mes, año, estado, fecha de vencimiento y socio asociado.
*   El estado del pago debe ser uno de los valores permitidos: `Pending`, `Paid` o `Canceled`.
*   Al crear un pago, si no se informa un estado explícito, debe quedar con estado `Pending`.
*   El campo `payment_date` debe ser opcional y solo debe utilizarse cuando el pago se marque como abonado.
*   El sistema debe permitir actualizar el estado de un pago.
*   Si un pago pasa a estado `Paid`, debe registrar una fecha de pago.
*   Si un pago pasa a estado `Canceled`, debe conservarse en la base de datos.
*   El sistema no debe permitir el borrado físico de pagos.
*   La operación de eliminación debe interpretarse como una cancelación lógica del pago.
*   El sistema debe permitir consultar los pagos de un socio específico.
*   El sistema debe permitir listar pagos filtrando por estado, mes, año o socio.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades y restricciones:

*   `id`: UUID. Identificador único del pago. Clave primaria.
*   `amount`: Float. Monto del pago. Debe ser mayor a 0.
*   `month`: Int. Mes correspondiente al pago. Debe estar entre 1 y 12.
*   `year`: Int. Año correspondiente al pago. Debe ser un valor válido.
*   `status`: String o Enum. Estado del pago. Valores permitidos: `Pending`, `Paid`, `Canceled`.
*   `due_date`: Date. Fecha de vencimiento del pago.
*   `payment_date`: DateTime nullable. Fecha en la que se registró el pago como abonado.
*   `member_id`: UUID. Clave foránea asociada a la entidad `Member`.

Relación principal:

*   Un `Member` puede tener muchos `Payment`.
*   Un `Payment` pertenece a un único `Member`.

Regla de negocio asociada:

*   Los registros de `Payment` son inmutables respecto a eliminación física.
*   No se permite `hard delete`.
*   Un pago solo puede ser anulado cambiando su `status` a `Canceled`.

Ejemplo conceptual del modelo:

```ts
Payment {
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    due_date: string;
    payment_date?: string | null;
    member_id: string;
}
```

### Contrato de API (@alentapp/shared)

Se definirán los tipos compartidos en el paquete `@alentapp/shared` para mantener sincronización entre frontend y backend.

#### Crear Pago

*   **Endpoint**: `POST /api/v1/payments`
*   **Request Body**:

```ts
{
    amount: number;
    month: number;
    year: number;
    due_date: string; // ISO Date String YYYY-MM-DD
    member_id: string;
}
```

*   **Response esperada**: `201 Created`

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    due_date: string;
    payment_date: string | null;
    member_id: string;
}
```

#### Listar Pagos

*   **Endpoint**: `GET /api/v1/payments`
*   **Query Params opcionales**:

```ts
{
    status?: 'Pending' | 'Paid' | 'Canceled';
    month?: number;
    year?: number;
    member_id?: string;
}
```

*   **Response esperada**: `200 OK`

```ts
[
    {
        id: string;
        amount: number;
        month: number;
        year: number;
        status: 'Pending' | 'Paid' | 'Canceled';
        due_date: string;
        payment_date: string | null;
        member_id: string;
    }
]
```

#### Obtener Pago por ID

*   **Endpoint**: `GET /api/v1/payments/:id`
*   **Request Body**: `None`
*   **Response esperada**: `200 OK`

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    due_date: string;
    payment_date: string | null;
    member_id: string;
}
```

#### Actualizar Pago

La actualización de pagos debe ser limitada para no romper la trazabilidad del movimiento económico.

*   **Endpoint**: `PUT /api/v1/payments/:id`
*   **Request Body**:

```ts
{
    amount?: number;
    month?: number;
    year?: number;
    due_date?: string;
    status?: 'Pending' | 'Paid' | 'Canceled';
    payment_date?: string | null;
}
```

*   **Response esperada**: `200 OK`

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Pending' | 'Paid' | 'Canceled';
    due_date: string;
    payment_date: string | null;
    member_id: string;
}
```

#### Cancelar Pago

La cancelación reemplaza al borrado físico.

*   **Endpoint**: `DELETE /api/v1/payments/:id`
*   **Request Body**: `None`
*   **Comportamiento esperado**: No elimina físicamente el registro. Actualiza el campo `status` a `Canceled`.

*   **Response esperada**: `200 OK`

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: 'Canceled';
    due_date: string;
    payment_date: string | null;
    member_id: string;
}
```

También puede implementarse explícitamente como:

*   **Endpoint alternativo**: `PATCH /api/v1/payments/:id/cancel`

Este endpoint sería más claro semánticamente, ya que evita confundir la operación con un borrado físico real.

### Componentes de Arquitectura Hexagonal

*   **Domain**:
    *   Entidad `Payment`.
    *   Enumeración `PaymentStatus`.
    *   Reglas de negocio:
        *   El monto debe ser mayor a 0.
        *   El mes debe estar entre 1 y 12.
        *   El estado debe ser `Pending`, `Paid` o `Canceled`.
        *   Un pago cancelado no debe eliminarse físicamente.
        *   Un pago abonado debe tener `payment_date`.
        *   Un pago pendiente no debería tener `payment_date`.
    *   Validadores de dominio para monto, período, estado y fechas.

*   **Application**:
    *   Puerto `PaymentRepository`.
    *   Caso de uso `CreatePaymentUseCase`.
    *   Caso de uso `GetPaymentsUseCase`.
    *   Caso de uso `GetPaymentByIdUseCase`.
    *   Caso de uso `UpdatePaymentUseCase`.
    *   Caso de uso `CancelPaymentUseCase`.
    *   Validación de existencia del socio mediante `MemberRepository` antes de crear un pago.
    *   Orquestación de reglas de negocio antes de persistir cambios.

*   **Infrastructure**:
    *   Adaptador de salida `PostgresPaymentRepository`.
    *   Implementación con Prisma.
    *   Controlador HTTP `PaymentController`.
    *   Rutas HTTP registradas en la aplicación.
    *   Mapeo de errores de dominio a códigos HTTP.
    *   Persistencia de la relación entre `Payment` y `Member`.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                             | Código HTTP               |
| -------------------------------- | -------------------------------------------------------------- | ------------------------- |
| Socio inexistente                | Mensaje: "El socio asociado al pago no existe"                | 400 Bad Request           |
| Monto menor o igual a 0          | Mensaje: "El monto del pago debe ser mayor a cero"            | 400 Bad Request           |
| Mes fuera del rango permitido    | Mensaje: "El mes debe estar comprendido entre 1 y 12"         | 400 Bad Request           |
| Estado inválido                  | Mensaje: "El estado del pago no es válido"                    | 400 Bad Request           |
| Pago inexistente                 | Mensaje: "El pago no existe"                                  | 404 Not Found             |
| Pago marcado como Paid sin fecha | Mensaje: "La fecha de pago es obligatoria para pagos abonados" | 400 Bad Request           |
| Pago pendiente con fecha de pago | Mensaje: "Un pago pendiente no debe tener fecha de pago"      | 400 Bad Request           |
| Intento de borrado físico        | El sistema no elimina el registro y cambia estado a Canceled   | 200 OK                    |
| Pago ya cancelado                | Mensaje: "El pago ya se encuentra cancelado"                  | 409 Conflict              |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"                 | 500 Internal Server Error |

## Plan de Implementación

1. Definir la entidad `Payment` en el esquema de Prisma, incluyendo su relación con `Member`.
2. Definir la enumeración de estados permitidos: `Pending`, `Paid`, `Canceled`.
3. Crear y ejecutar la migración correspondiente en la base de datos.
4. Definir los tipos compartidos en `@alentapp/shared`:
    *   `PaymentStatus`.
    *   `CreatePaymentRequest`.
    *   `UpdatePaymentRequest`.
    *   `PaymentResponse`.
    *   `PaymentFilters`.
5. Crear el puerto `PaymentRepository` en la capa de aplicación o dominio.
6. Implementar el adaptador `PostgresPaymentRepository` usando Prisma.
7. Implementar el caso de uso `CreatePaymentUseCase`.
8. Implementar el caso de uso `GetPaymentsUseCase`.
9. Implementar el caso de uso `GetPaymentByIdUseCase`.
10. Implementar el caso de uso `UpdatePaymentUseCase`.
11. Implementar el caso de uso `CancelPaymentUseCase`, evitando cualquier operación de borrado físico.
12. Crear el `PaymentController` con los endpoints correspondientes.
13. Registrar las rutas de pagos en la configuración principal de la aplicación.
14. Implementar el servicio de frontend para consumir los endpoints de pagos.
15. Crear la vista o sección de administración de pagos.
16. Agregar filtros por socio, estado, mes y año.
17. Agregar validaciones visuales en el formulario de creación y edición de pagos.
18. Agregar una confirmación antes de cancelar un pago.
19. Verificar que la cancelación modifique únicamente el campo `status` a `Canceled`.
20. Probar los casos de borde definidos en este documento.
