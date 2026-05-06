---
id: 0005
estado: Aprobado
autor: Benjamín Briones
fecha: 2026-05-02
titulo: Actualización de Pagos de Socios
---

# TDD-0005: Actualización de Pagos de Socios

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos actualizar información de un pago existente, manteniendo la trazabilidad de los movimientos económicos y evitando modificaciones que generen inconsistencias contables.

La actualización debe permitir corregir datos operativos como monto, período, fecha de vencimiento o estado del pago. Sin embargo, debe respetar las reglas de negocio asociadas al estado del pago, especialmente cuando un pago pasa a estado `Paid` o `Canceled`.

### User Persona

*   **Nombre**: Administrador de Pagos
*   **Rol**: Tesorero/Administrativo
*   **Necesidad**: Corregir errores de carga o actualizar el estado de un pago cuando un socio abona una cuota pendiente, sin perder la trazabilidad del registro.

### Criterios de Aceptación

*   El sistema debe permitir actualizar un pago existente.
*   El sistema debe validar que el pago exista antes de modificarlo.
*   El sistema debe permitir actualizar monto, mes, año, fecha de vencimiento, estado y fecha de pago.
*   El sistema debe validar que el monto sea mayor a cero si se modifica.
*   El sistema debe validar que el mes esté comprendido entre 1 y 12 si se modifica.
*   El sistema debe validar que el estado sea `Pending`, `Paid` o `Canceled`.
*   Si el pago pasa a estado `Paid`, debe registrar una `payment_date`.
*   Si el pago queda en estado `Pending`, no debe tener `payment_date`.
*   Si el pago pasa a estado `Canceled`, debe conservarse en la base de datos.
*   Si la actualización es correcta, el sistema debe retornar los datos actualizados del pago.

## Diseño Técnico (RFC)

### Modelo de Datos

La actualización operará sobre la entidad `Payment` ya existente:

*   `id`: UUID. Identificador único del pago. No modificable.
*   `amount`: Float. Monto del pago. Debe ser mayor a 0.
*   `month`: Int. Mes correspondiente al pago. Debe estar entre 1 y 12.
*   `year`: Int. Año correspondiente al pago. Debe ser válido.
*   `status`: Enum. Estado del pago. Valores permitidos: `Pending`, `Paid`, `Canceled`.
*   `due_date`: Date. Fecha de vencimiento del pago.
*   `payment_date`: DateTime nullable. Fecha en la que se registró el pago como abonado.
*   `member_id`: UUID. Socio asociado. No debería modificarse desde este caso de uso para preservar trazabilidad.
*   `updated_at`: DateTime. Se actualiza automáticamente al modificar el registro.

Reglas de actualización:

*   No se debe modificar el `id`.
*   No se debe modificar el `member_id` desde este endpoint.
*   Si `status` es `Paid`, `payment_date` debe estar informada.
*   Si `status` es `Pending`, `payment_date` debe ser `null`.
*   Si `status` es `Canceled`, el registro debe permanecer persistido.

### Contrato de API (@alentapp/shared)

*   **Endpoint**: `PUT /api/v1/payments/:id`
*   **Request Body**: `UpdatePaymentRequest`

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
**Response esperada:** 200 OK

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
    - Validadores de dominio para monto, período, estado y fecha de pago.
    - Reglas:
        Un pago abonado debe tener payment_date.
        Un pago pendiente no debe tener payment_date.
        Un pago cancelado no debe eliminarse físicamente.
2. **Application**:
    - Puerto PaymentRepository.
    - Caso de uso UpdatePaymentUseCase.
    - Validación de existencia del pago mediante findById.
    - Orquestación de reglas antes de persistir los cambios.
3. **Infrastructure**:
    - Adaptador de salida PostgresPaymentRepository.
    - Método update(id, data) implementado con Prisma.
    - Controlador HTTP PaymentController.
    - Ruta PUT /api/v1/payments/:id.
    - Mapeo de errores de dominio a códigos HTTP.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                             | Código HTTP               |
| -------------------------------- | -------------------------------------------------------------- | ------------------------- |
| Pago inexistente                 | Mensaje: "El pago no existe"                                   | 404 Not Found             |
| Monto menor o igual a 0          | Mensaje: "El monto del pago debe ser mayor a cero"             | 400 Bad Request           |
| Mes fuera del rango permitido    | Mensaje: "El mes debe estar comprendido entre 1 y 12"          | 400 Bad Request           |
| Año inválido                     | Mensaje: "El año del pago no es válido"                        | 400 Bad Request           |
| Estado inválido                  | Mensaje: "El estado del pago no es válido"                     | 400 Bad Request           |
| Pago marcado como Paid sin fecha | Mensaje: "La fecha de pago es obligatoria para pagos abonados" | 400 Bad Request           |
| Pago Pending con fecha de pago   | Mensaje: "Un pago pendiente no debe tener fecha de pago"       | 400 Bad Request           |
| Intento de modificar member_id   | Mensaje: "No se puede modificar el socio asociado al pago"     | 400 Bad Request           |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"                  | 500 Internal Server Error |

## Plan de Implementación

1. Definir en @alentapp/shared el tipo UpdatePaymentRequest.
2. Ampliar el puerto PaymentRepository con el método update(id, data).
3. Implementar el método update en PostgresPaymentRepository.
4. Crear validadores de dominio para monto, mes, año, estado y fecha de pago.
5. Implementar el caso de uso UpdatePaymentUseCase.
6. Validar la existencia del pago antes de modificarlo.
7. Bloquear la modificación de id y member_id.
8. Crear el endpoint PUT /api/v1/payments/:id en PaymentController.
9. Consumir el endpoint desde el servicio frontend de pagos.
10. Reutilizar o crear un formulario de edición de pagos.
11. Mostrar mensajes claros ante errores de validación.
12. Probar los casos de borde definidos en este documento.