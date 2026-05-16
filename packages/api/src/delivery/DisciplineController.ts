import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateDisciplineUseCase } from '../application/CreateDisciplineUseCase.js';
import { CreateDisciplineRequest } from '@alentapp/shared';

export class DisciplineController {
    constructor(
        private readonly createDisciplineUseCase: CreateDisciplineUseCase,
    ) {}
    async create(
        request: FastifyRequest<{ Body: CreateDisciplineRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const disciplina = await this.createDisciplineUseCase.execute(request.body);
            return reply.status(201).send({ data: disciplina });
        } catch (error: any) {
            if (error.message.includes('El socio no existe')) {
                return reply.status(404).send({ message: error.message });
            }

            if (
                error.message.includes('Todos los campos son requeridos') ||
                error.message.includes('El motivo de la sanción es obligatorio') ||
                error.message.includes('El campo is_total_suspension debe ser booleano') ||
                error.message.includes('Formato de fecha inválido') ||
                error.message.includes('La fecha de fin debe ser estrictamente posterior')
            ) {
                return reply.status(400).send({ message: error.message });
            }

            return reply.status(500).send({ message: "Error interno, reintente más tarde" });
        }
    }
}