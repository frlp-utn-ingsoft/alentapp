import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateEquipmentLoanUseCase } from '../application/CreateEquipmentLoanUseCase.js';
import { CreateEquipmentLoanRequest } from '@alentapp/shared';

export class EquipmentLoanController {
    constructor(
        private readonly createEquipmentLoanUseCase: CreateEquipmentLoanUseCase,
    ) {}

    async getAll(_request: FastifyRequest, reply: FastifyReply) {
        // Placeholder para la ruta GET — se completa en rama update/delete si se necesita
        // Por ahora retorna 200 vacío para que la ruta registrada no falle
        return reply.status(200).send({ data: [] });
    }

    async create(
        request: FastifyRequest<{ Body: CreateEquipmentLoanRequest }>,
        reply: FastifyReply,
    ) {
        try {
            const loan = await this.createEquipmentLoanUseCase.execute(request.body);
            return reply.status(201).send({ data: loan });
        } catch (error: any) {
            if (error.message.includes('Cadet')) {
                return reply.status(403).send({ error: error.message });
            }
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (
                error.message.includes('fecha') ||
                error.message.includes('ítem')
            ) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Error interno, reintente más tarde.' });
        }
    }
}