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
- Al finalizar, el sistema retorna 201 Created con el objeto generado y limpia el formulario.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades y restricciones:

`id`: Identificador único universal (UUID).
`amount`: Float (monto de la cuota/pago).
`month`: Int (1-12).
`year`: Int (ej. 2026).
`status`: Enumeración (`Pending`, `Paid`, `Canceled`). Default: `Pending`.
`due_date`: Date (fecha de vencimiento).
`payment_date`: Datetime, nullable.
`member_id`: UUID (FK hacia Member).
`created_at`: Datetime
`updated_at`: Datetime
`deleted_at`: Datetime?

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

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interface en el Dominio).
2. Caso de Uso: CreatePayment (Valida socio, reglas de negocio y persiste).
3. Adaptador de Salida: DB Persistence Adapter (Implementación real en BD).
4. Adaptador de Entrada: PaymentController.

## Casos de Borde y Errores

| Escenario                        | Resultado Esperado                                    | Código HTTP               |
| -------------------------------- | ----------------------------------------------------- | ------------------------- |
| `member_id` no existe en BBDD    | Mensaje: "El socio especificado no existe"            | 404 Not Found             |
| `amount` <= 0                    | Mensaje: "El monto debe ser mayor a cero"             | 400 Bad Request           |
| `month` fuera de rango (1-12)    | Mensaje: "Mes inválido. Debe estar entre 1 y 12"      | 400 Bad Request           |
| `year` fuera de rango (ej. 2026) | Mensaje: "Año inválido. Debe estar entre 1900 y 2100" | 400 Bad Request           |
| Error de conexión a DB           | Mensaje: "Error interno, reintente más tarde"         | 500 Internal Server Error |

## Plan de Implementación

1. Definir esquema de persistencia para `Payment` y correr migración.
2. Crear tipos en `@alentapp/shared` y puerto `PaymentRepository` en el Dominio.
3. Implementar el repositorio y el caso de uso `CreatePayment`.
4. Crear componente React para el formulario y conectar con el endpoint del backend.
