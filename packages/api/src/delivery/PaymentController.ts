import { FastifyRequest, FastifyReply } from 'fastify';
import {
    NewPaymentUseCase,
    MemberNotFoundError,
    MemberNotActiveError,
    DuplicateActivePaymentError,
} from '../application/NewPaymentUseCase.js';
import { GetPaymentsUseCase } from '../application/GetPaymentsUseCase.js';
import { CreatePaymentRequest } from '@alentapp/shared';

export class PaymentController {
    constructor(
        private readonly newPaymentUseCase: NewPaymentUseCase,
        private readonly getPaymentsUseCase: GetPaymentsUseCase,
    ) {}

    async getAll(
        request: FastifyRequest<{ Querystring: { member_id?: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { member_id } = request.query ?? {};
            const payments = await this.getPaymentsUseCase.execute(
                member_id ? { member_id } : undefined,
            );
            return reply.status(200).send({ data: payments });
        } catch (error) {
            return this.handleError(error, reply, request);
        }
    }

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.newPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error) {
            return this.handleError(error, reply, request);
        }
    }

    private handleError(error: unknown, reply: FastifyReply, request: FastifyRequest) {
        request.log.error({ err: error }, 'Payment operation failed');

        if (error instanceof MemberNotFoundError) {
            return reply.status(404).send({ error: error.message });
        }

        if (
            error instanceof MemberNotActiveError ||
            error instanceof DuplicateActivePaymentError
        ) {
            return reply.status(409).send({ error: error.message });
        }

        if (error instanceof Error) {
            if (
                error.message.includes('inválido') ||
                error.message.includes('La fecha de vencimiento debe ser futura')
            ) {
                return reply.status(400).send({ error: error.message });
            }
        }

        return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
}