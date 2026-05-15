import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMedicalCertificateUseCase } from '../application/CreateMedicalCertificateUseCase.js';
import { CreateMedicalCertificateRequest } from '../types/MedicalCertificate.js';
import { MedicalCertificateRepository } from '../domain/services/medicalCertificateRepository.js';

export class MedicalCertificateController {
    constructor(
        private readonly createUseCase: CreateMedicalCertificateUseCase,
    ) {}


    async create(
        request: FastifyRequest<{ Body: CreateMedicalCertificateRequest }>,
        reply: FastifyReply,
    ) {
        try {
            request.log.info('Iniciando registro de nuevo certificado médico');
            
            //Ejecuta la lógica del Caso de Uso
            const certificate = await this.createUseCase.execute(request.body);
            
            //Retornamos 201 Created con la estructura estándar
            return reply.status(201).send({ data: certificate });
            
        } catch (error: any) {
            // Mapeo de errores de negocio a códigos HTTP (400 Bad Request)
            if (
                error.message.includes('obligatoria') || 
                error.message.includes('posterior')
            ) {
                return reply.status(400).send({ error: error.message });
            }

            // Mapeo de error de socio inexistente (404 Not Found)
            if (error.message.includes('no se encuentra registrado')) {
                return reply.status(404).send({ error: error.message });
            }

            // Error de servidor (500 Internal Server Error)
            request.log.error(`[MedicalCertificateController] Error: ${error.message}`);
            return reply.status(500).send({ error: "Error interno, reintente más tarde" });
        }
    }
}
