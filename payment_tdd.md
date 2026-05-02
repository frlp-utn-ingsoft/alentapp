*** 1 Contexto del negocio (EL QUE). ***

El módulo de Payment permite gestionar las cuotas sociales de los socios del club, registrando obligaciones financieras y su estado (pendiente, pagado o vencido).
Es fundamental para mantener la integridad financiera del sistema y garantizar trazabilidad, ya que los pagos no pueden eliminarse, solo cambiar de estado.

*** 1.2 USER/PERSONAS ***

Administrativo: Necesita registrar pagos y controlar deudas.
Tesorero: Consulta el estado de cuenta de los socios.
Socio: Quiere saber el historial de las cuotas pendientes o pagadas.

***  1.3 Criterios de aceptación (USER STORIES) ***
Yo como administrativo de la institución necesito registrar pagos.
 Escenario de éxito: El usuario registra el pago correctamente y el sistema muestra un pop up con la leyenda "Pago registrado correctamente"
 Escenario de fallo: El pago no se registra correctamente y el sistema despliega un pop up con la leyenda "El pago no se pudo registrar"

Yo como administrativo de la institucion necesito controlar el estado de las cuotas de cada socio.
 Escenario de éxito: El usuario ingresa al historial de cuotas de un soscio y el sistema le muestra un listado de cuotas con su estado correspondiente.
 Escenario de fallo: El sistema no muestra el listado y muestra un cartel de error.

Yo como socio necesito sabe el historial de mis cuotas.
 Escenario de exito: El usuario ingresa al historial de cuotas y el sistema le muestra un listado de cuotas con su estado correspondiente.
 Escenario de fallo: El sistema no muestra el listado y muestra un cartel de error.

Yo como tesorero quiero ver el estado de cada socio.
 Escenario de éxito: El usuario ingresa al hitorial de cada socio y el sistema le despliega todas las cuotas y su estado actual.
Escenario de fallo: El sistema no muestra el listado y muestra un cartel de error.

 *** 2 Diseño técnico (EL COMO) ***
 *** 2.1 Modelado de dominio ***
export interface Payment {
  id: string;
  amount: number;
  month: number;
  year: number;
  status: 'Pending' | 'Paid' | 'Canceled';
  due_date: Date;
  payment_date?: Date;
  member_id: string;
}

*** 2.2 Contrato de pagos (SHARED DTO´S) ***

/*Crear pago*/

endpoint: POST /api/payments
 Request body

 {
  "memberId": "number",
  "monto": 10000,
  "mesReferencia": 10
  "FechaPago": "02/10/26,
  "fechaVencimiento": "2026-11-26"
}

/*Registrar pago*/

PUT /api/payments/{id}

/*Cancelar pago*/

PUT /api/payments/{id}/cancel

/*Obtener pagos*/

GET /api/payments {member_id}

*** 2.3 esquema de persistencia(PRISMA)***

model Payment {
  id            String   @id @default(uuid())
  amount        Float
  month         Int
  year          Int
  status        String
  due_date      DateTime
  payment_date  DateTime
  member_id     String

  
}



