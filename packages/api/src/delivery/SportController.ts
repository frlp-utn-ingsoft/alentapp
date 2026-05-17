import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateSportUseCase } from '../application/CreateSportUseCase.js';
import { GetSportsUseCase } from '../application/GetSportsUseCase.js';
import { CreateSportRequest } from '@alentapp/shared';

export class SportController {
    constructor(
        private readonly createSportUseCase: CreateSportUseCase,
        private readonly getSportsUseCase: GetSportsUseCase,
    ) {}

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const sports = await this.getSportsUseCase.execute();
            return reply.status(200).send({ data: sports });
        } catch (error: any) {
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }

    async create(
        request: FastifyRequest<{ Body: CreateSportRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const sport = await this.createSportUseCase.execute(request.body);
            return reply.status(201).send({ data: sport });
        } catch (error: any) {
            if (error.message.includes('Ya existe')) {
                return reply.status(409).send({ error: error.message });
            }

            if (
                error.message.includes('obligatorios') ||
                error.message.includes('cupo') ||
                error.message.includes('precio')
            ) {
                return reply.status(400).send({ error: error.message });
            }

            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}