import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePaymentRequest } from '@alentapp/shared';
import { CreatePaymentUseCase } from '../application/Payment/NewPaymentUseCase.js';
import { GetPaymentsUseCase } from '../application/Payment/GetPaymentsUseCase.js';
import { DeletePaymentUseCase } from '../application/Payment/DeletePaymentUseCase.js';
export class PaymentController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
        private readonly deletePaymentUseCase: DeletePaymentUseCase,
    ) {}
    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            request.log.info('Alguien pegó al endpoint de crear pago');
            const payment = await this.createPaymentUseCase.execute(
                request.body,
            );
            return reply.status(201).send({ data: payment });
        } catch (error: any) {
            if (
                error.message.includes('inválido') ||
                error.message.includes('mayor a cero') ||
                error.message.includes('entre 1 y 12') ||
                error.message.includes('año actual o futuro') ||
                error.message.includes('inválida') ||
                error.message.includes('campos obligatorios')
            ) {
                return reply.status(400).send({ error: error.message });
            }
            if (
                error.message.includes(
                    'Ya existe un pago para este miembro en el mes y año especificados',
                )
            ) {
                return reply.status(409).send({ error: error.message });
            }
            if (error.message.includes('El miembro especificado no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            return reply
                .status(500)
                .send({ error: 'Error interno, reintente más tarde' });
        }
    }
    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const payments = await this.getPaymentsUseCase.execute();
            return reply.status(200).send({ data: payments });
        } catch (error: any) {
            console.error('Error obteniendo pagos:', error);
            return reply
                .status(500)
                .send({ error: 'Error interno, reintente más tarde' });
        }
    }
    async cancel(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;

            request.log.info({ id }, 'Cancelando pago');

            const payment = await this.deletePaymentUseCase.execute(id);

            return reply.status(200).send({ data: payment });
        } catch (error: any) {
            const message =
                error instanceof Error ? error.message : 'Error desconocido';

            if (message === 'Pago no encontrado') {
                return reply.status(404).send({ error: message });
            }

            if (
                message === 'El pago ya se encuentra cancelado' ||
                message === 'No se puede cancelar un pago ya pagado'
            ) {
                return reply.status(409).send({ error: message });
            }

            request.log.error(
                {
                    message: error?.message,
                    stack: error?.stack,
                    error,
                },
                'Error al cancelar pago',
            );

            return reply
                .status(500)
                .send({ error: 'Error interno, reintente más tarde' });
        }
    }
}
