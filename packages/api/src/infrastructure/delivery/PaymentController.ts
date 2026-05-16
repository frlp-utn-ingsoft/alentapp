import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentUseCase } from '../../application/CreatePaymentUseCase.js';
import { GetPaymentsUseCase } from '../../application/GetPaymentsUseCase.js';
import { CreatePaymentRequest } from '@alentapp/shared';

export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
    ) {}

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const payments = await this.getPaymentsUseCase.execute();
            return reply.status(200).send({ data: payments });
        } catch {
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            if (error.message === 'El socio indicado no existe') {
                return reply.status(404).send({ error: error.message });
            }
            if (
                error.message === 'El monto debe ser mayor a cero' ||
                error.message === 'El monto debe ser un valor numérico' ||
                error.message === 'La fecha de pago es inválida o está ausente' ||
                error.message === 'Datos inválidos'
            ) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
