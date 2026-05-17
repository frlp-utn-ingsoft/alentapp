**Estado:** Propuesto
**Autor:** Nahuel Iróz
**Fecha:** 2026-05-03



/*1. Contexto de Negocio*/

*** 1.1. Objetivo ***

Permitir marcar una cuota como pagada.

*** 1.2. User Personas ***

**Tesorero**

* Registra pagos recibidos
* Necesita evitar inconsistencias


*** 1.3. Criterios de Aceptación ***

**User Story:**
Yo como tesorero quiero marcar una cuota como pagada para reflejar que la deuda fue saldada.

Éxito

* Estado pasa a `PAID`
* Se registra `paymentDate`

Fallos

* Payment inexistente
* Ya pagado


/*2. Diseño Técnico*/

*** 2.1. API ***

`PATCH /api/v1/payments/:id`

json
{
  "status": "PAID"
}

/*3. Arquitectura y Flujo*/

*** 3.1. Repository ***


findById(id: string): Promise<Payment | null>;
update(payment: Payment): Promise<Payment>;

*** 3.2. Lógica ***

1. Buscar Payment
2. Validar existencia
3. Validar estado actual:

   * no debe ser `PAID`
   * no debe ser `CANCELED`
4. Actualizar:

   * status -> PAID
   * paymentDate → now()
5. Persistir

/*4. Condiciones de borde*/

| Escenario | HTTP |
| --------- | ---- |
| No existe | 404  |
| Ya pagado | 400  |
| Cancelado | 400  |
| Error DB  | 500  |

