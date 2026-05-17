import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateEquipmentLoanUseCase } from '../application/CreateEquipmentLoanUseCase.js';
import { CreateEquipmentLoanRequest } from '@alentapp/shared';

export class EquipmentLoanController {
    constructor(
        private readonly createEquipmentLoanUseCase: CreateEquipmentLoanUseCase
    ) {}

    async create(
        request: FastifyRequest<{ Body: CreateEquipmentLoanRequest }>,
        reply: FastifyReply,
    ) {
        try {
            if (!request.body.item_name || !request.body.due_date || !request.body.member_id) {
                return reply.status(400).send({ error: 'El nombre del ítem, la fecha de devolución y el member_id son requeridos' });
            }

            const loan = await this.createEquipmentLoanUseCase.execute(request.body);
            return reply.status(201).send({ data: loan });
        } catch (error: any) {
            console.error("ERROR EN EL CONTROLLER:", error);

            // Mapeamos los errores del Caso de Uso a Status Codes HTTP
            if (error.message.includes('no existe')) {
                return reply.status(404).send({ error: error.message });
            }
            if (error.message.includes('prohibido')) {
                return reply.status(403).send({ error: error.message });
            }
            
            // Fallback para otros errores
            return reply.status(500).send({ error: 'Error interno, reintente más tarde' });
        }
    }
}