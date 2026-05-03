---
id: 0025
estado: Propuesto
autor: Lucas Legorburu
fecha: 2026-05-03
titulo: Consulta de Payment
---

# TDD-0025: Consulta de Payment

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo consulte el detalle de un pago puntual o el listado completo de pagos, con posibilidad de filtrar por socio o estado, facilitando el seguimiento y auditoría del historial de pagos del club.

### User Persona

- **Nombre**: Laura (Administrativa de Tesorería).
- **Necesidad**: Verificar el estado actual de un pago específico o revisar todos los pagos registrados para un socio, de modo de detectar deudas pendientes o confirmar cobros realizados.

### Criterios de Aceptación

- El sistema debe permitir obtener un único pago a partir de su `id`.
- Si el `id` no corresponde a ningún pago existente, el sistema debe responder con un error 404.
- El sistema debe permitir listar todos los pagos registrados.
- El listado debe admitir filtros opcionales por `miembro_id` y por `estado`.
- Cada ítem del listado debe incluir todos los campos del pago, incluyendo el `estado` actual.
- Si no existen pagos que coincidan con los filtros aplicados, el sistema debe retornar una lista vacía (no un error).

## Diseño Técnico (RFC)

### Modelo de Datos

Se reutiliza la entidad `Payment` definida en TDD-0024. No se requieren cambios de esquema.

- La consulta por `id` devuelve el registro completo.
- El listado soporta filtros opcionales aplicados como condiciones `WHERE` en Prisma (`miembro_id`, `estado`).

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización.

**Consulta por ID:**

- **Endpoint**: `GET /api/v1/pagos/:id`
- **Request Body**: Ninguno.
- **Response** `200 OK`:

```ts
{
    id: string;
    monto: number;
    descripcion: string | null;
    estado: 'Pendiente' | 'Completado' | 'Cancelado';
    fechaPago: string;
    miembro_id: string;
    creadoEl: string;
    actualizadoEl: string;
}
```

**Listado con filtros opcionales:**

- **Endpoint**: `GET /api/v1/pagos`
- **Query Params**:

```ts
{
    miembro_id?: string; // Filtrar por socio.
    estado?: 'Pendiente' | 'Completado' | 'Cancelado'; // Filtrar por estado.
}
```

- **Response** `200 OK`:

```ts
{
    data: Array<{
        id: string;
        monto: number;
        descripcion: string | null;
        estado: 'Pendiente' | 'Completado' | 'Cancelado';
        fechaPago: string;
        miembro_id: string;
        creadoEl: string;
        actualizadoEl: string;
    }>;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interfaz en el Dominio), con `findById` y `findAll` según filtros.
2. Caso de Uso: GetPaymentById y ListPayments (Consulta por `id` con error si no existe; listado con filtros opcionales `miembro_id` y `estado`).
3. Adaptador de Salida: Adaptador de persistencia en BD (implementación con Prisma).
4. Adaptador de Entrada: PaymentController (Rutas HTTP `GET /api/v1/pagos/:id` y `GET /api/v1/pagos`).

## Casos de Borde y Errores

| Escenario                                  | Resultado Esperado                                      | Código HTTP               |
| ------------------------------------------ | ------------------------------------------------------- | ------------------------- |
| `id` del pago no existe                    | Mensaje: "El pago indicado no existe"                   | 404 Not Found             |
| `id` con formato inválido (no UUID)        | Mensaje: "El identificador proporcionado no es válido"  | 400 Bad Request           |
| Filtro `estado` con valor no permitido     | Mensaje: "El estado indicado no es válido"              | 400 Bad Request           |
| Filtro `miembro_id` de socio inexistente   | Retorna lista vacía `{ data: [] }`                      | 200 OK                    |
| No hay pagos registrados                   | Retorna lista vacía `{ data: [] }`                      | 200 OK                    |
| Error de conexión a DB                     | Mensaje: "Error interno, reintente más tarde"           | 500 Internal Server Error |

## Plan de Implementación

1. Crear los tipos `PagoResponse` y `ListaPagosResponse` en `@alentapp/shared`.
2. Definir los métodos `findById` y `findAll` en el puerto `PaymentRepository`.
3. Implementar los casos de uso `GetPaymentById` y `ListPayments` en la capa de aplicación.
4. Implementar `findById` y `findAll` en el repositorio Prisma.
5. Crear los endpoints `GET /api/v1/pagos/:id` y `GET /api/v1/pagos` en `PaymentController`.
6. Integrar la vista de listado y detalle en el frontend consumiendo los nuevos endpoints.
