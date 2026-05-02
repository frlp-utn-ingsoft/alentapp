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

*** 3 Arquitectura y flujo***
*** 3.1. Definición del Puerto (Repository Interface)***
export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByMember(memberId: string): Promise<Payment[]>;
  findByMemberAndPeriod(memberId: string, month: number, year: number): Promise<Payment | null>;
  update(payment: Payment): Promise<Payment>;
}

*** 3.2. Lógica del Caso de Uso ***

A continuación se describe el comportamiento del sistema ante las operaciones principales del módulo **Payment**, detallando los pasos que se ejecutan desde la recepción de la petición hasta la persistencia de los datos.

**Caso de Uso: Crear Pago**

**Descripción:**
Permite registrar una nueva obligación de pago para un socio.

**Flujo:**

1. Validar que los datos obligatorios estén presentes (`member_id`, `amount`, `month`, `year`, `due_date`).
2. Verificar que el miembro asociado exista en el sistema.
3. Consultar si ya existe un pago para el mismo `member_id`, `month` y `year`.
4. Si existe se debe rechazar la operación (evitar duplicados).
5. Crear una nueva instancia de Payment con estado inicial `Pending`.
6. Persistir el Payment en la base de datos mediante el repositorio.

**Resultado:**
Se crea un nuevo pago asociado al socio.

**Caso de Uso: Registrar Pago**

**Descripción:**
Permite marcar una cuota como pagada.

**Flujo:**

1. Recibir el `id` del pago.
2. Buscar el Payment en la base de datos.
3. Si no existe se debe retornar error.
4. Validar que el estado NO sea `Canceled` ni `Paid`.
5. Actualizar el estado a `Paid`.
6. Registrar la fecha actual en `payment_date`.
7. Persistir los cambios en la base de datos.

**Resultado:**
La cuota queda registrada como pagada.

**Caso de Uso: Cancelar pago**

**Descripción:**
Permite anular un pago sin eliminarlo del sistema.

**Flujo:**

1. Recibir el `id` del pago.
2. Buscar el pago en la base de datos.
3. Si no existe se debe retornar error.
4. Actualizar el estado a `Canceled`.
5. Persistir los cambios.

**Resultado:**
El pago de la cuota queda en estado cancelado.

**Regla de negocio:**
No se permite eliminar registros de pago (inmutabilidad).


**Caso de Uso: Obtener Payments de un Member**

**Descripción:**
Permite consultar todos los pagos de un socio.

**Flujo:**

1. Recibir `member_id`.
2. Validar que el Member exista.
3. Consultar los Payments asociados a ese `member_id`.
4. Retornar la lista de resultados.

**Resultado:**
Listado de pagos del socio.

*** 4. Casos de Borde y Manejo de Errores ***

| Escenario           | Descripción                                                                           |  Codigo http
| ----------------    | ------------------------------------------------------------------------------------- |-----------------
| Datos faltantes     | Campos obligatorios (`member_id`, `amount`, `month`, `year`, `due_date`) no presentes | 400 Bad Request
| Formato inválido    | Tipos de datos incorrectos (ej: `amount` negativo, `month` fuera de rango 1–12)       | 400 Bad Request
| Fecha inválida      | `due_date` anterior a la fecha actual o mal formada                                   | 400 Bad Request
| Payment duplicado   | Ya existe un pago para el mismo `member_id`, `month` y `year`                         |  409 Conflict
| Pago ya registrado  | Se intenta pagar un Payment con estado `Paid`                                         |  409 Conflict
| Pago cancelado      | Se intenta pagar un Payment con estado `Canceled`                                     |  409 Conflict
| Payment inexistente | No existe un Payment con el `id` proporcionado                                        | 404 Not Found
| Member inexistente  | El `member_id` no corresponde a ningún socio registrado                               | 404 Not Found



