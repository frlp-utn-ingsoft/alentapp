---
id: 0024
estado: Propuesto
autor: Lucas Legorburu
fecha: 2026-05-03
titulo: Alta de Payment.
---

# TDD-0023: Alta de Payment

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo registre un nuevo pago de forma digital, garantizando la integridad de los datos ingresados y su correcta asociación al socio correspondiente. El registro queda disponible de forma inmediata para consulta y auditoría.

### User Persona

- **Nombre**: Laura (Administrativa de Tesorería).
- **Necesidad**: Registrar los pagos de cuotas o servicios de los socios de manera rápida y sin errores, asegurándose de que el monto, la fecha y el socio estén correctamente asociados desde el momento de la creación.

### Criterios de Aceptación

- El sistema debe validar que el campo `monto` sea un número positivo mayor a cero.
- El sistema debe validar que el campo `fechaPago` sea una fecha válida y esté presente.
- El sistema debe validar que el `miembro_id` corresponda a un socio existente en el sistema.
- El estado inicial del pago debe ser `Pendiente` de forma automática, sin intervención del usuario.
- Al finalizar con éxito, el sistema debe retornar el objeto `Payment` creado con su `id` asignado.
- El campo `monto` queda fijo en el momento de la creación y no puede modificarse posteriormente.

## Diseño Técnico (RFC)

### Modelo de Datos

Se definirá la entidad `Payment` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `monto`: Decimal — monto del pago (debe ser > 0, inmutable tras la creación).
- `descripcion`: Cadena de texto opcional — descripción o concepto del pago.
- `estado`: Enumeración `EstadoPago` — estado del pago (`Pendiente` por defecto).
- `fechaPago`: Fecha (datetime) en que se efectúa el pago.
- `miembro_id`: UUID — clave foránea a `Member`.
- `creadoEl`: Fecha de creación autogenerada.
- `actualizadoEl`: Fecha de última actualización (mantenida por el ORM).

```prisma
model Payment {
  id            String     @id @default(uuid())
  monto         Decimal
  descripcion   String?
  estado        EstadoPago @default(Pendiente)
  fechaPago     DateTime
  miembro_id    String
  miembro       Member     @relation(fields: [miembro_id], references: [id])
  creadoEl      DateTime   @default(now())
  actualizadoEl DateTime   @updatedAt
}

enum EstadoPago {
  Pendiente
  Completado
  Cancelado
}
```

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

- **Endpoint**: `POST /api/v1/pagos`
- **Request Body** (`CrearPagoRequest`):

```ts
{
    monto: number;       // Requerido. Debe ser > 0.
    descripcion?: string; // Opcional.
    fechaPago: string;   // Fecha ISO (YYYY-MM-DD). Requerido.
    miembro_id: string;  // UUID del socio. Requerido.
}
```

- **Response** `201 Created`:

```ts
{
    id: string;
    monto: number;
    descripcion: string | null;
    estado: 'Pendiente';
    fechaPago: string;
    miembro_id: string;
    creadoEl: string;
    actualizadoEl: string;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interfaz en el Dominio).
2. Caso de Uso: CreatePayment (Lógica que valida `monto > 0`, existencia del socio y persistencia del pago con estado inicial `Pendiente`).
3. Adaptador de Salida: Adaptador de persistencia en BD (implementación con Prisma).
4. Adaptador de Entrada: PaymentController (Ruta HTTP `POST /api/v1/pagos`).

## Casos de Borde y Errores

| Escenario                      | Resultado Esperado                                     | Código HTTP               |
| ----------------------------- | ------------------------------------------------------ | ------------------------- |
| `monto` es cero o negativo    | Mensaje: "El monto debe ser mayor a cero"              | 400 Bad Request           |
| `monto` no es un número       | Mensaje: "El monto debe ser un valor numérico"         | 400 Bad Request           |
| `fechaPago` ausente o inválida | Mensaje: "La fecha de pago es inválida o está ausente" | 400 Bad Request           |
| `miembro_id` no existe        | Mensaje: "El socio indicado no existe"                 | 404 Not Found             |
| Datos requeridos faltantes    | Mensaje: "Datos inválidos"                             | 400 Bad Request           |
| Error de conexión a DB        | Mensaje: "Error interno, reintente más tarde"        | 500 Internal Server Error |

## Plan de Implementación

1. Definir el modelo `Payment`, el enum `EstadoPago` en el esquema de Prisma y ejecutar la migración.
2. Crear los tipos `CrearPagoRequest` y `PagoResponse` en `@alentapp/shared`.
3. Implementar la entidad de dominio `Payment` y el puerto `PaymentRepository`.
4. Implementar el caso de uso `CreatePayment` en la capa de aplicación.
5. Implementar el repositorio con Prisma en infraestructura.
6. Crear el endpoint `POST /api/v1/pagos` en `PaymentController`.
7. Conectar el formulario de alta del frontend con el nuevo endpoint.
