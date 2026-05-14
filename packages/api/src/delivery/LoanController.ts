import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLoanUseCase } from '../application/CreateLoanUseCase.js';
import { CreateLoanRequest } from '@alentapp/shared';

export class LoanController {
    constructor(
        private readonly createLoanUseCase: CreateLoanUseCase
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateLoanRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.createLoanUseCase.execute(request.body);
            return reply.status(201).send({ data: loan });
        } catch (error: any) {
            return this.handleError(error, reply);
        }
    }

    

    private handleError(error: Error, reply: FastifyReply) {
if (
            error.message.includes('Faltan campos requeridos') ||
            error.message.includes('obligatorio') ||
            error.message.includes('no es válido') ||
            error.message.includes('posterior') ||
            error.message.includes('ya finalized') ||
            error.message.includes('ya fue marcado')
        ) {
            return reply.status(400).send({ error: error.message });
        }

        if (error.message.includes('Cadetes tienen prohibido')) {
            return reply.status(403).send({ error: error.message });
        }

        if (error.message.includes('Tiempo límite')) {
            return reply.status(403).send({ error: error.message });
        }

        if (error.message.includes('no existe')) {
            return reply.status(404).send({ error: error.message });
        }

        return reply.status(500).send({ error: 'Error interno, reintente mas tarde' });
    }
}