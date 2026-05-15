import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CreatePaymentRequest } from '@alentapp/shared';
import type { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.js';

export class PaymentController {
    constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.createPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            const message = error.message;

            if (message === 'El socio asociado al pago no existe') {
                return reply.status(404).send({ error: message });
            }

            if (
                message === 'El monto del pago debe ser mayor a cero' ||
                message === 'El mes debe estar comprendido entre 1 y 12' ||
                message === 'El socio asociado al pago es obligatorio' ||
                message === 'La fecha de pago es obligatoria para pagos abonados' ||
                message === 'Un pago pendiente no debe tener fecha de pago' ||
                message.startsWith('El año del pago') ||
                message.startsWith('El estado del pago') ||
                message.startsWith('La fecha de vencimiento') ||
                message.startsWith('La fecha de pago')
            ) {
                return reply.status(400).send({ error: message });
            }

            request.log.error({ err: error }, 'Error inesperado al crear pago');
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
