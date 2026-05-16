import { FastifyRequest, FastifyReply } from 'fastify';
import { NewPaymentUseCase } from '../application/NewPaymentUseCase.js';
import { GetPaymentsUseCase } from '../application/GetPaymentsUseCase.js';
import {
    MemberNotFoundError,
    MemberNotActiveError,
    DuplicateActivePaymentError,
} from '../application/NewPaymentUseCase.js';
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
        } catch (error: unknown) {
            return this.handleError(error, reply);
        }
    }

    async create(
        request: FastifyRequest<{ Body: CreatePaymentRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const payment = await this.newPaymentUseCase.execute(request.body);
            return reply.status(201).send({ data: payment });
        } catch (error: unknown) {
            return this.handleError(error, reply);
        }
    }

    // Mapeo centralizado de errores de dominio → HTTP.
    // Esta versión cubre los errores relevantes a Crear/Listar.
    // En branches siguientes se sumarán los de Cobrar/Editar/Cancelar.
    private handleError(error: unknown, reply: FastifyReply) {
        // 404 - Not Found
        if (error instanceof MemberNotFoundError) {
            return reply.status(404).send({ error: error.message });
        }

        // 409 - Conflict
        if (
            error instanceof MemberNotActiveError ||
            error instanceof DuplicateActivePaymentError
        ) {
            return reply.status(409).send({ error: error.message });
        }

        // 400 - Bad Request (validaciones de input)
        if (error instanceof Error) {
            if (
                error.message.includes('inválido') ||
                error.message.includes('La fecha de vencimiento debe ser futura')
            ) {
                return reply.status(400).send({ error: error.message });
            }
        }

        // 500 - Error interno
        return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
    }
}
