import { FastifyRequest, FastifyReply } from 'fastify';
import { NewPaymentUseCase } from '../application/NewPaymentUseCase.js';

export class PaymentController {
  constructor(private readonly newPaymentUseCase: NewPaymentUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const newPayment = await this.newPaymentUseCase.execute(request.body);
      
      return reply.status(201).send({
        id: newPayment.id,
        status: newPayment.status
      });
    } catch (error: any) {
      // Si el caso de uso detectó un duplicado, devolvemos 409 Conflict
      if (error.message === "DUPLICATE_PERIOD") {
        return reply.status(409).send({ error: "Ya existe una cuota generada para este socio en el período seleccionado." });
      }
      
      // Cualquier otro error de validación va con 400 Bad Request
      return reply.status(400).send({ error: error.message });
    }
  }
}