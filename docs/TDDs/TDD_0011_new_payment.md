---
id: "0011"
estado: Propuesto
autor: Hajime
fecha: 2026-05-02
titulo: Alta de Pago
---

# TDD-0011: Alta de Pago

## Contexto de Negocio (PRD)

### Objetivo

Permitir registrar un nuevo pago realizado por un socio del Club Alentapp. El sistema debe garantizar que cada pago quede asentado con su monto, mes, año y estado, de forma que el historial de pagos sea íntegro e inmutable (no se permite el borrado físico).

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Registrar el pago de la cuota mensual de un socio de forma rápida y sin errores, asegurándose de que el historial quede correctamente asentado para auditorías futuras.

### Criterios de Aceptación

- El sistema debe validar que el socio exista antes de registrar el pago.
- El sistema debe validar que `amount` sea un número positivo.
- El sistema debe validar que `month` esté entre 1 y 12, y que `year` sea un año válido (mayor a 2000).
- El estado inicial del pago debe ser `"Pending"` por defecto.
- Si la carga es correcta, el sistema debe crear el pago y devolver sus datos.

## Diseño Técnico (RFC)

### Modelo de Datos

Entidad `Payment`:

- `id`: UUID, clave primaria.
- `amount`: float, requerido, mayor a cero.
- `month`: int, requerido (1–12).
- `year`: int, requerido.
- `status`: string, enumeración (`Pending`, `Paid`, `Canceled`), valor por defecto `Pending`.
- `due_date`: date, requerido.
- `payment_date`: DateTime, nullable (se completa al marcar como pagado).
- `member_id`: UUID, foreign key hacia `Member`.

### Contrato de API (@alentapp/shared)

- Endpoint: `POST /api/v1/payments`
- Request Body (`CreatePaymentRequest`):

```ts
{
    amount: number;
    month: number;       // 1–12
    year: number;
    dueDate: string;     // ISO Date String (YYYY-MM-DD)
    memberId: string;
}
```

- Response (`PaymentResponse`):

```ts
{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: "Pending" | "Paid" | "Canceled";
    dueDate: string;
    paymentDate: string | null;
    memberId: string;
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**: Entidad `Payment` con las reglas de validación (monto positivo, mes entre 1 y 12, año válido).
- **Application**: Caso de uso `CreatePaymentUseCase` (valida datos, verifica existencia del socio y delega la persistencia). Puertos: `PaymentRepository` (método `create(payment)`) y `MemberRepository` (método `findById(id)`).
- **Infrastructure**: `PostgresPaymentRepository` (implementación de `create` usando Prisma). `PaymentController` (ruta `POST /api/v1/payments` que recibe el body y devuelve status 201).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                                        | Código HTTP               |
| -------------------------- | --------------------------------------------------------- | ------------------------- |
| Datos faltantes            | Mensaje: "Faltan campos requeridos"                       | 400 Bad Request           |
| Monto no positivo          | Mensaje: "El monto debe ser mayor a cero"                 | 400 Bad Request           |
| Mes fuera de rango         | Mensaje: "El mes debe estar entre 1 y 12"                 | 400 Bad Request           |
| Año inválido               | Mensaje: "El año ingresado no es válido"                  | 400 Bad Request           |
| Socio inexistente          | Mensaje: "El socio especificado no existe"                | 404 Not Found             |
| Error de conexión a DB     | Mensaje: "Error interno, reintente más tarde"             | 500 Internal Server Error |
| Creación exitosa           | Datos del pago creado con status "Pending"                | 201 Created               |

## Plan de Implementación

1. Definir `CreatePaymentRequest` y `PaymentResponse` en `@alentapp/shared`.
2. Crear la migración de Prisma para la tabla `Payment`.
3. Crear la entidad de dominio `Payment` con las validaciones de monto, mes y año.
4. Crear el puerto `PaymentRepository` con el método `create`.
5. Reutilizar `MemberRepository.findById` para validar que el socio exista.
6. Implementar `CreatePaymentUseCase`.
7. Implementar `PostgresPaymentRepository`.
8. Crear el endpoint `POST /api/v1/payments` en el `PaymentController` y registrarlo en `app.ts`.
9. Agregar el formulario de alta de pago en el Frontend.
10. Agregar tests unitarios del caso de uso y tests de integración del endpoint.