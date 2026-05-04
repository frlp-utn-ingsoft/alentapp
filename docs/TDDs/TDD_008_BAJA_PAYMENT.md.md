**Estado:** Propuesto
**Autor:** Nahuel Iróz
**Fecha:** 2026-05-03


/*Baja de Payment (Cancelación lógica)*/

*** 1. Contexto de Negocio***

*** 1.1. Objetivo ***

Permitir anular una cuota sin eliminarla.

Regla clave:

* No se permite borrado físico; solo s permite el cambio de estado 

*** 1.2. User Personas ***

**Tesorero**

* Es la persona encargada de corrgier algún error admnistrativo


*** 1.3. Criterios de Aceptación ***

**User Story:**
Yo como tesorero quiero cancelar un pago para invalidarlo sin borrarlo.

***Éxito***

* Estado -> `CANCELED`

***Fallos***

*Payment inexistente

/*2. Diseño Técnico*/

*** 2.1. API ***
 
`PATCH /api/v1/payments/:id`

json
{
  "status": "CANCELED"
}

/*3. Arquitectura y Flujo*/

***3.1. Repository***

findById(id: string): Promise<Payment | null>;
update(payment: Payment): Promise<Payment>;

***3.2. Lógica***

1. Buscar Payment
2. Validar existencia
3. Validar que no esté cancelado
4. Cambiar estado → CANCELED
5. Persistir

/*4. Condiciones de borde*/

| Escenario    | HTTP |
| ------------ | ---- |
| No existe    | 404  |
| Ya cancelado | 400  |
| Error DB     | 500  |

/*PLAN DE IMPLEMENTACION*/

1- Confirmar que el modelo soporte el estado CANCELED (enum).
2- Reutilizar DTO de actualización (UpdatePaymentDTO).
3- Reutilizar métodos del repositorio (findById, update).
4- Implementar el caso de uso cancelPayment:
 Validar existencia
 Validar que no esté ya cancelado
5- Cambiar estado a CANCELED
6- Exponer endpoint PATCH /api/v1/payments/:id (misma ruta que update).
7- Implementar acción en frontend (botón “Cancelar”).
8- Validar que no exista borrado físico (DELETE deshabilitado).
