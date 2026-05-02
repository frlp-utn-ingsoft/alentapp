---
autor: Ignacio Benitez
fecha: 2026-05-01
titulo: Cancelación de Pago (Inmutabilidad)
---

# TDD-0103: Cancelación de Pago (Inmutabilidad)

## Contexto de Negocio (PRD)

### Objetivo
Mantener un historial financiero inmutable, asegurando que los pagos erróneos no se eliminen físicamente, sino que cambien de estado para auditoría.

### User Persona
* **Nombre**: Tesorero / Administrativo.
* **Necesidad**: Cancelar transacciones incorrectas sin perder el rastro de la operación en el sistema.

### Criterios de Aceptación
* Si el Administrativo cancela el pago, el sistema debe cambiar su estado a 'Canceled' y mantener el registro en la base de datos.
* Si se intenta realizar un borrado físico del registro (DELETE), el sistema debe bloquear la operación y retornar un error.
* El sistema debe verificar que el pago exista y que su estado actual no sea ya "Canceled" o "Paid".

## Diseño Técnico (RFC)

### Modelo de Datos
Se modifica el campo `status` de la entidad `Payment` a `Canceled`.

### Contrato de API (@alentapp/shared)
* **Endpoint**: `PATCH /api/v1/payment/{id}/cancel`
* **Request Body**:
{}

### Componentes de Arquitectura Hexagonal
* **Domain**: Regla de inmutabilidad: no se permite el borrado físico.
* **Application**: Caso de Uso `CancelPayment`. Utiliza el puerto `PaymentRepository.updateStatus(id, 'Canceled')`.
* **Infrastructure**: Importante: No existe método `delete()` en el Repositorio cumpliendo la regla.

## Casos de Borde y Errores
| Escenario                   | Resultado Esperado                               | Código HTTP               |
| ----------------------------| --------------------------------------------- | ------------------------- |
| Borrado Físico              | El sistema rechaza cualquier intento de eliminar un registro (inmutabilidad) | 405 Method Not Allowed |
| Recurso inexistente         | Intento de cancelar un ID que no existe | 404 Not Found   |

## Plan de Implementación
1. Asegurar que no se implemente método DELETE en el repositorio.
2. Crear endpoint PATCH para la ruta `/cancel`.
3. Implementar validación de estado previo en el caso de uso.