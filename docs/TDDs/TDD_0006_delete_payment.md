---
id: 0006
estado: Propuesto
autor: Avril Lugo Gonzalez
fecha: 2026-05-03
titulo: Eliminación de Pagos Existentes
---

# TDD-0006: Eliminación de Pagos Existentes

## Contexto de Negocio (PRD)

### Objetivo

Permitir a los administrativos dar de baja los pagos existentes. En otras palabras, se debe permitir que los pagos pasen a estado 'Cancelado'.

### User Persona

- Nombre: Juan (Tesorero/Administrativo).
- Necesidad: Dar de baja que un pago que no se pudo realizar o se cargó de manera errónea, de forma rápida desde la misma tabla principal. Necesita una advertencia antes de realizar la baja para no cometer equivocaciones irreparables. Un pago, una vez cancelado, no puede modificarse su estado. 

### Criterios de Aceptación

- Yo como usuario quiero eliminar los pagos asociados a un socio en específico. Necesito un mensaje de advertencia antes de borrar para no cometer equivocaciones irreparables.

### Escenario de éxito

- Si el usuario solicita la baja de un pago, el sistema debe cambiar el estado de este a 'Cancelado' e informarlo mediante un mensaje de éxito.

### Escenario de fallo

- Si el usuario intenta dar de baja un pago con un ID inexistente, el sistema debe rechazar la operación e informar el error mediante un mensaje en pantalla. 

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

- Endpoint: `DELETE /api/v1/payment/:id`
- Request Body: `None`
- Response: `204 No Content` en caso de éxito.

### Componentes de Arquitectura Hexagonal

1. Puerto: `PaymentRepository` (Método `delete(id)`).
2. Caso de Uso: `DeletePaymentUseCase` (Comprueba existencia previa vía `findById` y delega la eliminación).
3. Adaptador de Salida: `PostgresPaymentRepository` (Eliminación usando el método `delete` de Prisma).
4. Adaptador de Entrada: `PaymentController` (Ruta HTTP que extrae el `id` y devuelve un status 204).

## Casos de Borde y Errores

| Escenario                  | Resultado Esperado                            | Código HTTP actual        |
| -------------------------- | --------------------------------------------- | ------------------------- |
| Pago inexistente           | Mensaje: "El pago no existe"                  | 400 Bad Request           |
| Error de conexión a DB     | Mensaje: "Error al procesar la operación, intente más tarde" | 500 Internal Server Error |
| Eliminación exitosa        | Respuesta vacía                               | 204 No Content            |


## Plan de Implementación

1. Ampliar el `PaymentRepository` y `PostgresPaymentRepository` con el método `delete`.
2. Crear la lógica de negocio en `DeletePaymentUseCase`.
3. Crear el endpoint `DELETE /api/v1/payment/:id` en el `PaymentController` y registrarlo en `app.ts`.
4. Añadir el método `delete` al servicio Frontend (`payment.ts`).
5. Enlazar el botón de eliminación en `PaymentView.tsx` agregando la confirmación del navegador (`window.confirm`) antes de hacer la llamada.
