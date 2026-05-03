---
id: 0006
estado: Propuesto
autor: Avril Lugo Gonzalez
fecha: 2026-05-03
titulo: Eliminación de Pagos Existentes
---

# TDD-0003: Eliminación de Pagos Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja de forma lógica los pagos existentes. En otras palabras, se debe permitir que los pagos pasen a estado 'Cancelado'.

### User Persona

- Nombre: Juan (Tesorero/Administrativo).
- Necesidad: Dar de baja que un pago que no se pudo realizar o se cargó de manera errónea, de forma rápida desde la misma tabla principal. Necesita una advertencia antes de realizar la baja para no cometer equivocaciones irreparables. Un pago, una vez cancelado, no puede modificarse su estado. 

### Criterios de Aceptación

- Yo como usuario quiero anular un pago para corregir errores de carga sin que el registro desaparezca del sistema.

### Escenario de éxito

- Si el usuario modifica el estado de 'Pago' o 'Pendiente' a 'Cancelado', el sistema guarda el registro e informa que la baja se realizó con éxito.

### Escenario de fallo

- Si el usuario intenta modificar algún dato relacionado al pago cuando este ya está en estado 'Cancelado', el sistema anula la operación y muestra en pantalla un mensaje de error. 

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

Al tratarse de una baja lógica y no físca, el metodo DELETE no se implementa; solamente se usa el método PUT.

- Endpoint: `PUT /api/v1/payment/:id`
- Request Body (UpdatePaymentRequest): 

```ts
{
    amount?: float;
    month?: int;
    year?: int;
    due_date?: date;
    payment_date?: datetime;
    member_id?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. Puerto: PaymentRepository (metodo update(id, data)).
2. Servicio de Dominio: `PaymentValidator`.
3. Caso de Uso: UpdatePayment (orquesta la validación y llama al repositorio).
4. Adaptador de Salida: PostgresPaymentRepository (actualización usando el método `update` de Prisma).
5. Adaptador de Entrada: PaymentController (Ruta HTTP, se extrae el id especificado en la url y mapea excepciones a códigos HTTP).

## Casos de Borde y Errores

| Escenario                   | Resultado Esperado                            | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Pago Inexistente            | Mensaje: "El pago ingresado no existe"        | 404 Not Found             |
| Cambio de Estado Inválido   | Mensaje: "El estado del pago es actualmente 'Cancelado', no es posible modificarlo 'Pago' a 'Pendiente', la acción es irreversible" | 400 Bad Request |
| Modificación de Datos Inválida | Mensaje: "Los datos del pago no pueden ser modificados porque se encuentra en estado 'Cancelado'" 
| Error en la Base de Datos   | Mensaje: "Error al procesar la operación, intente más tarde" | 500 Internal Server Error |
| Cambio a 'Cancelado'  | Mensaje: "Pago cancelado con éxito"    | 200 OK                    |

## Plan de Implementación

1. Actualizar las interfaces en el paquete `@alentapp/shared` (`UpdatePaymentRequest`).
2. Ampliar el `PaymentRepository` con el método `update`.
3. Implementar la lógica en `UpdatePaymentUseCase` utilizando el `PaymentValidator` centralizado.
4. Crear la ruta `PUT` en el controlador y enlazarla a la app de Fastify.
5. Consumir el endpoint desde el servicio de Frontend y reutilizar el modal de creación para permitir la edición.
