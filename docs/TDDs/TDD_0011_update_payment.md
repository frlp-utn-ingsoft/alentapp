---
id: 0011
estado: Pendiente
autor: Ernesto Ardenghi
fecha: 2026-05-02
titulo: Modificación de Pagos
---

# TDD-0011: Modificación de Pagos

## Contexto de Negocio (PRD)

### Objetivo

Permitir la actualización de datos de un pago existente, principalmente para registrar su acreditación (cambio a "Paid") o corregir montos/fechas mientras se encuentra pendiente. Se aplica la regla de inmutabilidad para pagos finalizados.

### User Persona

Nombre: Anastasia (Tesorera/Administrativa).
Necesidad: Corregir errores de carga o marcar manualmente un pago como acreditado cuando se confirma vía transferencia/efectivo, sin generar registros duplicados.

### Criterios de Aceptación

- Solo se permite modificar pagos cuyo `status` sea "Pending".
- Si el estado cambia a "Paid", el sistema debe autogenerar `payment_date` con la fecha/hora actual del servidor.
- Los campos `amount`, `month`, `year` y `due_date` son inmutables una vez el pago pasa a "Paid" o "Canceled".
- Al finalizar, el sistema retorna 200 OK con el objeto actualizado.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Se utilizará el paquete compaortido para definir el cuerpo de la petición. Todos los campos son opcionales ya que se trata de una actualización parcial (PUT a nivel de negocio).

- Endpoint: `PUT /api/v1/pagos/:id`
- Request Body (UpdatePaymentRequest):

```ts
{
    amount?:    number;
    due_date?:  string;
    status?:    'Pending' | 'Paid';
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `PaymentRepository`(Método `update(id, data)`).
2. **Servicio de Dominio**: `PaymentValidator`(Validaciones de amount, due_date, status).
3. **Caso de Uso**: `UpdatePaymentUseCase` (Valida estado actual, aplica inmutabilidad, llama al repositorio).
4. **Adaptador de Salida**: `PostgreSQLPaymentRepository` (Actualización usando el método update de Prisma).
5. **Adaptador de Entrada**: `PaymentController` (Ruta HTTP que extrae el `id` de la URL y mapea excepciones a códigos HTTP).

### Casos de Borde y Errores

| Escenario                                       | Resultado Esperado                                            | Código HTTP               |
| ----------------------------------------------- | ------------------------------------------------------------- | ------------------------- |
| Pago ya está en estado "Paid" o "Canceled"      | Mensaje: "No se permiten modificaciones en pagos finalizados" | 409 Conflict              |
| Intento de modificar `amount` con status "Paid" | Mensaje: "Campo inmutable para pagos acreditados"             | 400 Bad Request           |
| Cambio a "Paid" exitoso                         | `payment_date` se autocompleta y status cambia                | 200 OK                    |
| ID de pago inexistente                          | Mensaje: "Pago no encontrado"                                 | 404 Not Found             |
| Error de conexión a DB                          | Mensaje: "Error interno, reintente más tarde"                 | 500 Internal Server Error |

## Plan de Implementación

1. Añadir validaciones de inmutabilidad en el caso de uso `UpdatePaymentUseCase`.
2. Implementar lógica de autogeneración de `payment_date` al detectar cambio a "Paid".
3. Exponer ruta `PUT` en `PaymentController` y enlazarla a la app con Fastify.
4. Consumir el endpoint en el frontend con campos deshabilitados según estado.
