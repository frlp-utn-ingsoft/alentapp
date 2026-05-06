---
id: 0004
estado: Aprobado
autor: Benjamín Briones
fecha: 2026-05-02
titulo: Registro de Pagos de Socios
---

# TDD-0004: Registro de Pagos de Socios

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos registrar pagos asociados a socios existentes, reemplazando el control manual de pagos y asegurando que cada movimiento económico quede correctamente identificado por socio, período, monto y fecha de vencimiento.

El sistema debe garantizar que no se registren pagos inválidos, incompletos o asociados a socios inexistentes. Al momento del alta, el pago debe quedar registrado con estado `Pending`, salvo que explícitamente se indique otro estado permitido por la regla de negocio.

### User Persona

*   **Nombre**: Administrador de Pagos
*   **Rol**: Tesorero/Administrativo
*   **Necesidad**: Registrar rápidamente los pagos o cuotas de los socios, evitando errores en montos, períodos o asociaciones incorrectas con socios inexistentes.

### Criterios de Aceptación

*   El sistema debe permitir registrar un pago asociado a un socio existente.
*   El sistema debe validar que el socio exista antes de crear el pago.
*   El sistema debe validar que el monto sea mayor a cero.
*   El sistema debe validar que el mes esté comprendido entre 1 y 12.
*   El sistema debe validar que el año sea un valor válido.
*   El sistema debe registrar la fecha de vencimiento del pago.
*   Al crear un pago, si no se informa un estado explícito, debe quedar con estado `Pending`.
*   El estado del pago debe ser uno de los valores permitidos: `Pending`, `Paid` o `Canceled`.
*   Si el pago se crea con estado `Paid`, debe registrar una `payment_date`.
*   Si el pago se crea con estado `Pending`, no debe tener `payment_date`.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades y restricciones:

*   `id`: UUID. Identificador único del pago. Clave primaria.
*   `amount`: Float. Monto del pago. Debe ser mayor a 0.
*   `month`: Int. Mes correspondiente al pago. Debe estar entre 1 y 12.
*   `year`: Int. Año correspondiente al pago. Debe ser un valor válido.
*   `status`: Enum. Estado del pago. Valores permitidos: `Pending`, `Paid`, `Canceled`.
*   `due_date`: Date. Fecha de vencimiento del pago.
*   `payment_date`: DateTime nullable. Fecha en la que se registró el pago como abonado.
*   `member_id`: UUID. Clave foránea asociada a la entidad `Member`.
*   `created_at`: DateTime. Fecha de creación del registro.
*   `updated_at`: DateTime. Fecha de última actualización del registro.

Relación principal:

*   Un `Member` puede tener muchos `Payment`.
*   Un `Payment` pertenece a un único `Member`.

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
    created_at: string;
    updated_at: string;
}
```
## Contrato de API (@alentapp/shared)

Se definirán los tipos compartidos en el paquete @alentapp/shared para mantener sincronización entre frontend y backend.

* Endpoint: POST /api/v1/payments
* Request Body: CreatePaymentRequest

```ts
{
    amount: number;
    month: number;
    year: number;
    due_date: string; // ISO Date String YYYY-MM-DD
    member_id: string;
    status?: 'Pending' | 'Paid' | 'Canceled';
    payment_date?: string | null;
}

```
**Response esperada**: 201 Created
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
    created_at: string;
    updated_at: string;
}
```
## Componentes de Arquitectura Hexagonal

1. **Domain**: 
    - Entidad Payment.
    - Enumeración PaymentStatus.
    - Reglas de negocio**:
        El monto debe ser mayor a 0.
        El mes debe estar entre 1 y 12.
        El estado debe ser Pending, Paid o Canceled.
        Un pago con estado Paid debe tener payment_date.
        Un pago con estado Pending no debe tener payment_date.
2. **Application**: 
    - Puerto PaymentRepository.
    - Puerto MemberRepository para validar la existencia del socio.
    - Caso de uso: CreatePaymentUseCase.
    - Validación de datos de entrada antes de persistir el pago.
3. **Infrastructure**:
    - Adaptador de salida PostgresPaymentRepository.
    - Implementación con Prisma.
    - Controlador HTTP PaymentController.
    - Ruta POST /api/v1/payments.
    - Mapeo de errores de dominio a códigos HTTP.

## Casos de Borde y Errores

| Escenario                       | Resultado Esperado                                             | Código HTTP               |
| ------------------------------- | -------------------------------------------------------------- | ------------------------- |
| Socio inexistente               | Mensaje: "El socio asociado al pago no existe"                 | 404 Not Found           |
| Monto menor o igual a 0         | Mensaje: "El monto del pago debe ser mayor a cero"             | 400 Bad Request           |
| Mes fuera del rango permitido   | Mensaje: "El mes debe estar comprendido entre 1 y 12"          | 400 Bad Request           |
| Año inválido                    | Mensaje: "El año del pago no es válido"                        | 400 Bad Request           |
| Estado inválido                 | Mensaje: "El estado del pago no es válido"                     | 400 Bad Request           |
| Pago creado como Paid sin fecha | Mensaje: "La fecha de pago es obligatoria para pagos abonados" | 400 Bad Request           |
| Pago Pending con fecha de pago  | Mensaje: "Un pago pendiente no debe tener fecha de pago"       | 400 Bad Request           |
| Error de conexión a DB          | Mensaje: "Error interno, reintente más tarde"                  | 500 Internal Server Error |

## Plan de Implementación

1. Definir la entidad Payment en el esquema de Prisma, incluyendo su relación con Member.
2. Definir la enumeración PaymentStatus con los valores Pending, Paid y Canceled.
3. Crear y ejecutar la migración correspondiente.
4. Definir en @alentapp/shared los tipos PaymentStatus, CreatePaymentRequest y PaymentResponse.
5. Crear el puerto PaymentRepository.
6. Implementar el método create en PostgresPaymentRepository.
7. Implementar el caso de uso CreatePaymentUseCase.
8. Validar la existencia del socio mediante MemberRepository.
9. Crear el endpoint POST /api/v1/payments en PaymentController.
10. Implementar el formulario de alta de pagos en el frontend.
11. Agregar validaciones visuales para monto, mes, año, estado y fecha de pago.
12. Probar los casos de borde definidos en este documento.