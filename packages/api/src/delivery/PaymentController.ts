import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentRequest, UpdatePaymentRequest } from '@alentapp/shared';
import { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.ts';
import { UpdatePaymentUseCase } from '../application/UpdatePaymentUseCase.ts';
import { GetPaymentsUseCase } from '../application/GetPaymentsUseCase.ts';

export class PaymentController {
    constructor(
        private createPaymentUseCase: CreatePaymentUseCase,
        private updatePaymentUseCase: UpdatePaymentUseCase,
        private getPaymentsUseCase: GetPaymentsUseCase
    ) { }

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const payments = await this.getPaymentsUseCase.execute();
            return reply.status(200).send({ data: payments });
        } catch (error: any) {
            return reply.status(500).send({ error: 'Error al obtener los pagos' });
        }
    }

    async create(request: FastifyRequest<{ Body: CreatePaymentRequest }>, reply: FastifyReply) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send(payment);
        } catch (error: any) {
            const message = error.message;

            // Manejo de errores
            if (message.includes('no existe')) {
                return reply.status(404).send({ error: message });
            }

            if (message.includes('inválido') || message.includes('debe ser mayor')) {
                return reply.status(400).send({ error: message });
            }

            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async update(request: FastifyRequest<{ Params: { id: string }, Body: UpdatePaymentRequest }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const payment = await this.updatePaymentUseCase.execute(id, request.body);

            return reply.status(200).send(payment);
        } catch (error: any) {
            const message = error.message;

            if (message.includes('no encontrado')) {
                return reply.status(404).send({ error: message });
            }

            if (message.includes('finalizados') || message.includes('cancelados')) {
                return reply.status(409).send({ error: message });
            }

            if (message.includes('inválido') || message.includes('debe ser mayor')) {
                return reply.status(400).send({ error: message });
            }

            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}