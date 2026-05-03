---
id: "0014"
estado: Propuesto
autor: Hajime
fecha: 2026-05-02
titulo: Consulta y Listado de Pagos
---

# TDD-0014: Consulta y Listado de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos consultar el historial completo de pagos del club, con la posibilidad de filtrar por socio, estado o período. Al ser una entidad inmutable, el listado debe reflejar todos los registros incluyendo los cancelados, para garantizar trazabilidad financiera.

### User Persona

- **Nombre**: Alberto (Tesorero/Administrativo).
- **Necesidad**: Revisar rápidamente el estado de pagos de un socio o del mes en curso, detectar morosos y verificar que los pagos cancelados figuren en el historial.

### Criterios de Aceptación

- El sistema debe permitir listar todos los pagos, con filtros opcionales por `memberId`, `status`, `month` y `year`.
- El sistema debe permitir consultar el detalle de un único pago por su `id`.
- Los pagos cancelados deben aparecer en el listado (no se ocultan).
- Si no se encuentran resultados para los filtros aplicados, el sistema debe devolver una lista vacía (no un error).

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

#### Listado con filtros opcionales

- Endpoint: `GET /api/v1/payments`
- Query Params opcionales:
  - `memberId`: string (UUID)
  - `status`: `"Pending"` | `"Paid"` | `"Canceled"`
  - `month`: number (1–12)
  - `year`: number

- Response (`PaymentResponse[]`):

```ts
[
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
]
```

#### Detalle de un pago

- Endpoint: `GET /api/v1/payments/:id`
- Response (`PaymentResponse`): mismo tipo que el ítem del listado.

### Componentes de Arquitectura Hexagonal

- **Domain**: No se aplican reglas de negocio adicionales en la consulta; la entidad `Payment` es de solo lectura en este flujo.
- **Application**: Casos de uso `GetPaymentsUseCase` (aplica filtros opcionales y retorna la lista) y `GetPaymentByIdUseCase` (verifica existencia y retorna el detalle). Puerto: `PaymentRepository` (métodos `findAll(filters)` y `findById(id)`).
- **Infrastructure**: `PostgresPaymentRepository` (consultas usando Prisma con cláusula `where` dinámica). `PaymentController` (rutas `GET /api/v1/payments` y `GET /api/v1/payments/:id` que extraen query params o el `id` de la URL).

## Casos de Borde y Errores

| Escenario                       | Resultado Esperado                                      | Código HTTP               |
| ------------------------------- | ------------------------------------------------------- | ------------------------- |
| Sin resultados para los filtros | Lista vacía `[]`                                        | 200 OK                    |
| Pago inexistente (por id)       | Mensaje: "El pago especificado no existe"               | 404 Not Found             |
| Filtro `month` fuera de rango   | Mensaje: "El mes debe estar entre 1 y 12"               | 400 Bad Request           |
| Error de conexión a DB          | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |
| Consulta exitosa                | Lista de pagos o detalle del pago solicitado            | 200 OK                    |

## Plan de Implementación

1. Ampliar el `PaymentRepository` con los métodos `findAll(filters)` y `findById(id)`.
2. Implementar `GetPaymentsUseCase` y `GetPaymentByIdUseCase`.
3. Implementar los métodos de consulta en `PostgresPaymentRepository` usando Prisma.
4. Crear las rutas `GET /api/v1/payments` y `GET /api/v1/payments/:id` en el `PaymentController` y registrarlas en `app.ts`.
5. Agregar la tabla/listado de pagos en el Frontend con soporte para los filtros disponibles.
6. Agregar tests unitarios de los casos de uso y tests de integración de los endpoints.