import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.js';
import { CreatePaymentRequest } from '@alentapp/shared';

export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            if (error.message.includes('El socio especificado no existe')) {
                return reply.status(404).send({ error: error.message });
            }

            if (
                error.message.includes('Faltan campos requeridos') ||
                error.message.includes('El monto debe ser mayor a cero') ||
                error.message.includes('El mes debe estar entre 1 y 12') ||
                error.message.includes('El año ingresado no es válido')
            ) {
                return reply.status(400).send({ error: error.message });
            }

            return reply.status(500).send({
                error: 'Error interno, reintente más tarde',
            });
        }
    }
}
