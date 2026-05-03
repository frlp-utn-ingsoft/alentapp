---
id: 0026
estado: Propuesto
autor: Lucas Legorburu
fecha: 2026-05-03
titulo: Modificación de Payment
---

# TDD-0026: Modificación de Payment

## Contexto de Negocio (PRD)

### Objetivo

Permitir que un administrativo actualice información no crítica de un pago existente, como su descripción o la confirmación de su estado, preservando la integridad del monto original y bloqueando cualquier modificación sobre pagos ya cancelados.

### User Persona

- **Nombre**: Laura (Administrativa de Tesorería).
- **Necesidad**: Corregir la descripción de un pago mal registrado o confirmar un pago pendiente como completado, sin alterar el monto ni comprometer el historial de pagos del club.

### Criterios de Aceptación

- El sistema debe validar que el pago exista antes de intentar modificarlo.
- No se permite modificar un pago cuyo `estado` sea `Cancelado`.
- El campo `monto` es inmutable: no puede modificarse bajo ninguna circunstancia.
- Solo se permiten las transiciones de estado `Pendiente → Completado`. No se permite retroceder un estado (ej. `Completado → Pendiente`).
- Los campos editables son: `descripcion` y `estado` (únicamente hacia `Completado`).
- Al finalizar con éxito, el sistema debe retornar el objeto `Payment` actualizado.

## Diseño Técnico (RFC)

### Modelo de Datos

Se reutiliza la entidad `Payment` definida en TDD-0023. No se requieren cambios de esquema adicionales.

- `descripcion`: Cadena de texto opcional — único campo de texto editable.
- `estado`: Enumeración `EstadoPago` — puede actualizarse solo de `Pendiente` a `Completado`.
- `monto`: Decimal — **inmutable**, el sistema debe ignorar o rechazar cualquier intento de modificación.

### Contrato de API (@alentapp/shared)

Definiremos los tipos en el paquete compartido para asegurar sincronización:

- **Endpoint**: `PUT /api/v1/pagos/:id`
- **Request Body** (`ActualizarPagoRequest`):

```ts
{
    descripcion?: string; // Opcional. Nuevo concepto del pago.
    estado?: 'Completado'; // Opcional. Solo se acepta "Completado" como nuevo valor.
}
```

- **Response** `200 OK`:

```ts
{
    id: string;
    monto: number;
    descripcion: string | null;
    estado: 'Pendiente' | 'Completado';
    fechaPago: string;
    miembro_id: string;
    creadoEl: string;
    actualizadoEl: string;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (Interfaz en el Dominio).
2. Caso de Uso: UpdatePayment (Lógica que valida existencia, rechaza pagos `Cancelado`, valida transiciones de `estado` y descarta cambios sobre `monto`).
3. Adaptador de Salida: Adaptador de persistencia en BD (implementación con Prisma).
4. Adaptador de Entrada: PaymentController (Ruta HTTP `PUT /api/v1/pagos/:id`).

## Casos de Borde y Errores

| Escenario                                        | Resultado Esperado                                    | Código HTTP              |
| ------------------------------------------------ | ----------------------------------------------------- | ------------------------ |
| `id` del pago no existe                          | Mensaje: "El pago indicado no existe"                 | 404 Not Found            |
| El pago tiene `estado: Cancelado`                | Mensaje: "No se puede modificar un pago cancelado"    | 409 Conflict             |
| Se intenta modificar `monto`                     | Mensaje: "El monto de un pago no puede modificarse"   | 400 Bad Request          |
| Transición de estado inválida (`Completado → Pendiente`) | Mensaje: "Transición de estado no permitida"   | 422 Unprocessable Entity |
| Body vacío (sin campos editables)                | Mensaje: "Debe proveer al menos un campo para actualizar" | 400 Bad Request      |
| Error de conexión a DB                          | Mensaje: "Error interno, reintente más tarde"          | 500 Internal Server Error |

## Plan de Implementación

1. Crear el tipo `ActualizarPagoRequest` en `@alentapp/shared`.
2. Agregar la lógica de validación de transiciones de `estado` en la entidad de dominio `Payment`.
3. Implementar el caso de uso `UpdatePayment` en la capa de aplicación.
4. Agregar el método `update` en el repositorio Prisma.
5. Crear el endpoint `PUT /api/v1/pagos/:id` en `PaymentController`.
6. Conectar el formulario de edición del frontend con el nuevo endpoint.
