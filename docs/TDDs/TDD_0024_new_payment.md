---
id: 0024
estado: Propuesto
autor: Lucas Legorburu
fecha: 2026-05-03
titulo: Alta de Payment.
---

# TDD-0024: Alta de Payment

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre un nuevo pago de forma digital, garantizando la integridad de los datos ingresados y su correcta asociación al socio correspondiente. El registro queda disponible de forma inmediata para consulta y auditoría.

### User Persona

- **Nombre**: Laura (Administrativa de Tesorería).
- **Necesidad**: Registrar los pagos de cuotas o servicios de los socios de manera rápida y sin errores, asegurándose de que el monto, la fecha y el socio estén correctamente asociados desde el momento de la creación.

### Criterios de Aceptación

- El sistema debe validar que el campo `amount` sea un número positivo mayor a cero.
- El sistema debe validar que el campo `paymentDate` sea una fecha válida y esté presente.
- El sistema debe validar que el `memberId` corresponda a un socio existente en el sistema.
- El estado inicial del pago debe ser `Pending` de forma automática, sin intervención del usuario.
- Al finalizar con éxito, el sistema debe retornar el pago creado (incluye `id` asignado) dentro de `{ "data": ... }`.
- El campo `amount` queda fijo en el momento de la creación y no puede modificarse posteriormente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` persistente en base de datos, con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID), clave primaria.
- `amount`: Decimal o número monetario — monto del pago (debe ser > 0, inmutable tras la creación).
- `description`: Cadena de texto opcional — descripción o concepto del pago.
- `status`: Enumeración `PaymentStatus` — estado del negocio del pago (`Pending` por defecto al crear).
- `paymentDate`: Fecha/hora en que se efectúa el pago.
- `memberId`: UUID — clave foránea a la entidad `Member` (socio debe existir).
- `deletedAt`: Fecha/hora opcional (`null` al alta) — se usa solo para baja lógica (consultar TDD-0027); en alta siempre permanece `null`.
- `createdAt`: Fecha de creación autogenerada.
- `updatedAt`: Fecha de última actualización (auditoría).

**Enumeración `PaymentStatus`:**

- `Pending`: pago registrado pendiente de confirmación como pagado.
- `Paid`: pago confirmado.
- `Canceled`: pago cancelado (se alcanza mediante baja lógica).

### Contrato de API (@alentapp/shared)

**Éxito:** el cuerpo JSON usa `{ "data": ... }`. **Errores:** `{ "error": "<mensaje en español>" }`.

Definiremos los tipos en el paquete compartido para asegurar sincronización:

- **Endpoint**: `POST /api/v1/payments`
- **Request Body** (`CreatePaymentRequest`):

```ts
{
    amount: number;        // Requerido. Debe ser > 0.
    description?: string; // Opcional.
    paymentDate: string;   // ISO (por ejemplo date o datetime). Requerido.
    memberId: string;      // UUID del socio. Requerido.
}
```

- **Response** `201 Created`:

```ts
{
    data: {
        id: string;
        amount: number;
        description: string | null;
        status: "Pending";
        paymentDate: string;
        memberId: string;
        deletedAt: null;
        createdAt: string;
        updatedAt: string;
    };
}
```

### Componentes de Arquitectura Hexagonal

- **Domain**:
  - Entidad `Payment`.
  - Enum `PaymentStatus`.
  - Reglas de negocio: validar que `amount` sea válido (> 0), que `paymentDate` esté definido de forma coherent con el modelo, estado inicial `Pending`, `deletedAt` en creación igual a ausente/`null`; `amount` inmutable después de crear.
- **Application**:
  - Caso de uso `CreatePaymentUseCase`: validaciones de dominio aplicables, verificación de socio existente, persistencia del pago con estado inicial `Pending`.
  - Puerto de salida `IPaymentRepository` (`save`, y lecturas según otros TDDs).
- **Infrastructure**:
  - `PaymentController` (entrada HTTP `POST /api/v1/payments`).
  - `PaymentPrismaRepository` (u otro adaptador equivalente contra la BD).
  - Mapeadores DTO si hace falta entre modelo de persistencia y `CreatePaymentRequest` / `PaymentResponse`.

## Casos de Borde y Errores

| Escenario                      | Resultado Esperado                                     | Código HTTP               |
| ----------------------------- | ------------------------------------------------------ | ------------------------- |
| `amount` es cero o negativo    | Mensaje: "El monto debe ser mayor a cero"              | 400 Bad Request           |
| `amount` no es un número       | Mensaje: "El monto debe ser un valor numérico"         | 400 Bad Request           |
| `paymentDate` ausente o inválida | Mensaje: "La fecha de pago es inválida o está ausente" | 400 Bad Request           |
| `memberId` no existe        | Mensaje: "El socio indicado no existe"                 | 404 Not Found             |
| Datos requeridos faltantes    | Mensaje: "Datos inválidos"                             | 400 Bad Request           |
| Error de conexión a DB        | Mensaje: "Error interno, reintente más tarde"        | 500 Internal Server Error |

## Plan de Implementación

1. Definir en el esquema de persistencia la entidad `Payment`, el enum `PaymentStatus`, el campo `deletedAt` (nullable) y ejecutar migración.
2. Crear en `@alentapp/shared` los tipos `CreatePaymentRequest` y `PaymentResponse` (éxito envuelto en `data`).
3. Implementar la entidad de dominio `Payment` y el puerto `IPaymentRepository`.
4. Implementar el caso de uso `CreatePaymentUseCase` en la capa de aplicación.
5. Implementar `PaymentPrismaRepository` en infraestructura.
6. Crear el endpoint `POST /api/v1/payments` en `PaymentController`.
7. Conectar el formulario de alta del frontend con el nuevo endpoint.

## Cambios respecto de la versión anterior

- Eliminación del bloque de sintaxis Prisma; modelo descrito solo en inglés como persistencia BD.
- Nomenclatura en inglés (`amount`, `paymentDate`, `memberId`, `PaymentStatus`: `Pending` / `Paid` / `Canceled`, etc.) y enums/DTO sin español técnico.
- Respuestas exitosas envueltas en `data`; alineación con mensajes en español vía campo `error` en fallos HTTP.
- Incorporación de `deletedAt` en el modelo (nullable en alta).
- Endpoint recurso plural `payments` y DTO `CreatePaymentRequest`.
- Renombrado de puertos/casos de uso (`IPaymentRepository`, `CreatePaymentUseCase`, `PaymentPrismaRepository`) y sección de arquitectura hexagonal en formato Domain/Application/Infrastructure.

