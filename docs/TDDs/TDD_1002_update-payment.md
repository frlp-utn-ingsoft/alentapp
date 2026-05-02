---
id: 1002
estado: Pendiente
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Confirmación de Pago (Actualizar)
---

# TDD-1002: Confirmación de Pago (Actualizar)

## Contexto de Negocio (PRD)

### Objetivo
Permitir la modificación del estado o los detalles de un pago existente para registrar la confirmación de que un pago pendiente fue abonado.

### User Persona
* **Nombre**: Tesorero / Administrativo.
* **Necesidad**: Actualizar el estado de las transacciones en el sistema tras recibir los fondos.

### Criterios de Aceptación
* El sistema debe buscar el pago por ID para comprobar su existencia.
* El sistema debe permitir cambiar el estado de 'Pending' a 'Paid'.
* Se debe registrar la fecha de pago (`payment_date`) en la actualización.

## Diseño Técnico (RFC)

### Modelo de Datos
Sin cambios en Prisma. Se actualizan campos existentes de `Payment`:
* `status`: PaymentStatus.
* `payment_date`: DateTime.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `PATCH /api/v1/payment/{id}`
* **Request Body**:
```json
{
    "status": "Paid",
    "payment_date": "2026-05-05T10:00:00Z"
}
```

### Componentes de Arquitectura Hexagonal
* **Domain**: Entidad `Payment`.
* **Application**: Caso de Uso `UpdatePayment`. Puerto `PaymentRepository.updateStatus(id: string, status: PaymentStatus)`.
* **Infrastructure**: Adaptador de persistencia para ejecutar la actualización en PostgreSQL.

## Casos de Borde y Errores
| Escenario                            | Resultado Esperado                                                    | Código HTTP               |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------- |
| Recurso inexistente                  | Mensaje: "No existe un pago con ese ID"                               | 404 Not Found             |
| Pago ya confirmado (`Paid`)          | Mensaje: "El pago ya fue confirmado y no puede modificarse"           | 409 Conflict              |
| Pago ya cancelado (`Canceled`)       | Mensaje: "El pago está cancelado y no puede modificarse"              | 409 Conflict              |
| `payment_date` con formato inválido  | Mensaje: "Formato de fecha inválido"                                  | 400 Bad Request           |
| Error de conexión a DB               | Mensaje: "Error interno, reintente más tarde"                         | 500 Internal Server Error |

## Plan de Implementación
1. Crear DTO de actualización en el paquete shared.
2. Implementar el método `updateStatus` en el adaptador de Prisma.
3. Exponer el endpoint PATCH en el controlador.