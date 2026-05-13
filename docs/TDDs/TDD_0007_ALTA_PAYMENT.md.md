**Estado:** Propuesto
**Autor:** Nahuel Iróz
**Fecha:** 2026-05-03



*** 1. Contexto de Negocio (El "Qué")***

/*1.1. Objetivo*/

El objetivo de este caso de uso es permitir la generación de una nueva obligación financiera (cuota) asociada a un socio del club.

Este proceso es fundamental porque:

1 Representa el inicio del ciclo financiero de una cuota
2 Permite llevar control de deudas
3 Es la base para posteriores acciones (pago, vencimiento, cancelación)

El sistema debe garantizar:

1 Integridad de datos
2 No duplicación de cuotas para un mismo período
3 Inicialización correcta del estado

/*1.2. User Personas*/

**Tesorero**

1 Responsable de generar cuotas mensuales
2 Necesita asegurar que no se dupliquen pagos
3 Busca confiabilidad en los datos financieros


*** 1.3. Criterios de Aceptación (User Stories)***

**User Story:**
Yo como tesorero quiero generar una cuota para un socio para registrar su obligación de pago.

Escenario de éxito

1 Dado un socio válido
2 Cuando ingreso datos correctos
3 Entonces el sistema crea un Payment con:

  * estado `PENDING`
  * fecha de creación
  * sin fecha de pago


Escenarios de fallo

1. **Duplicación**

   * Si ya existe un Payment con:

     * mismo `memberId`
     * mismo `month`
     * mismo `year`
     El sistema debe rechazar la operación

2. **Datos inválidos**

   * Monto ≤ 0
   * Mes fuera de rango (1–12)
   * Fecha inválida

    El sistema debe rechazar la operación

/*2. Diseño Técnico (El "Cómo")*/

*** 2.1. Modelo de Dominio ***

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELED";

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  month: number;
  year: number;
  dueDate: Date;
  status: PaymentStatus;
  paymentDate?: Date;
  createdAt: Date;
}



/*2.2. Contrato de API*/

**Endpoint:**
`POST /api/v1/payments`

**Request Body:**

json:
{
  "memberId": "string",
  "amount": 10000,
  "month": 5,
  "year": 2026,
  "dueDate": "2026-05-10"
}


**Response (201 Created):**

json
{
  "id": "uuid",
  "status": "PENDING"
}

***2.3. Persistencia (Prisma)***


model Payment {
  id           String   @id @default(uuid())
  memberId     String
  amount       Float
  month        Int
  year         Int
  dueDate      DateTime
  status       PaymentStatus
  paymentDate  DateTime?
  createdAt    DateTime @default(now())

  @@unique([memberId, month, year])
}



/*3. Arquitectura y Flujo*/

***3.1. Repository Interface***


export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findByMemberAndPeriod(
    memberId: string,
    month: number,
    year: number
  ): Promise<Payment | null>;
}

***3.2. Lógica del Caso de Uso***

1. Validar estructura del request
2. Validar reglas de negocio:

   * monto > 0
   * mes válido
3. Consultar repositorio:
   * verificar duplicado
4. Crear entidad Payment:
   * status = PENDING
   * createdAt = now()
5. Persistir
6. Retornar resultado


***4. Casos de Borde y Errores***

| Escenario       | Descripción        | HTTP |
| --------------- | ------------------ | ---- |
| Datos faltantes | Campos requeridos  | 400  |
| Monto inválido  | amount ≤ 0         | 400  |
| Duplicado       | Ya existe cuota    | 409  |
| Error DB        | Falla persistencia | 500  |



