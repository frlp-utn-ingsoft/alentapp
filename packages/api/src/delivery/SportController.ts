import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateSportRequest } from '@alentapp/shared';
import { CreateSportUseCase } from '../application/CreateSportUseCase.js';

export class SportController {
    constructor(
        private readonly createSportUseCase: CreateSportUseCase,
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateSportRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const sport = await this.createSportUseCase.execute(request.body);
            return reply.status(201).send({ data: sport });
        } catch (error: any) {
            if (error.message.includes('Ya existe un deporte con ese nombre')) {
                return reply.status(409).send({ error: error.message });
            }
            if (
                error.message.includes('Faltan campos requeridos')
                || error.message.includes('El cupo máximo debe ser mayor a cero')
            ) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}