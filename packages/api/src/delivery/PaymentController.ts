import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.js';
import { UpdatePaymentUseCase } from '../application/UpdatePaymentUseCase.js';
import { CancelPaymentUseCase } from '../application/CancelPaymentUseCase.js';
import { CreatePaymentRequest, UpdatePaymentRequest } from '@alentapp/shared';

export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly updatePaymentUseCase: UpdatePaymentUseCase,
        private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            if (error.message.includes('No existe un socio')) {
                return reply.status(404).send({ error: error.message });
            }
            const badRequestMessages = ['inválido', 'requerido', 'mayor a cero', 'entre 1 y 12'];
            if (badRequestMessages.some(msg => error.message.includes(msg))) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Error interno, reintente más tarde" });
        }
    }

    async confirm(
        request: FastifyRequest<{ Params: { id: string }; Body: UpdatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const payment = await this.updatePaymentUseCase.execute(id, request.body);
            return reply.status(200).send({ data: payment });
        } catch (error: any) {
            if (error.message.includes('No existe un pago')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('ya fue confirmado') || error.message.includes('está cancelado')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    }

    async cancel(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const payment = await this.cancelPaymentUseCase.execute(id);
            return reply.status(200).send({ data: payment });
        } catch (error: any) {
            if (error.message.includes('No existe un pago')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('ya se encuentra cancelado') || error.message.includes('ya confirmado')) {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(400).send({ error: error.message });
        }
    }
}
