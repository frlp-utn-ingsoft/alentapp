import { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { CreateEquipmentLoanRequest } from '@alentapp/shared';

export class CreateEquipmentLoanUseCase {
    constructor(
        private readonly equipmentLoanRepository: EquipmentLoanRepository,
        private readonly memberRepository: MemberRepository // Inyectamos esto para buscar al socio
    ) {}

    async execute(data: CreateEquipmentLoanRequest) {
        // Busca al socio usando el repositorio
        const member = await this.memberRepository.findById(data.member_id);

        if (!member) {
            throw new Error('El socio referenciado no existe');
        }

        // Regla de Negocio: Filtrar a los Cadetes
        if (member.category === 'Cadete') {
            throw new Error('Los socios Cadete tienen prohibido solicitar material');
        }

        // Persistencia a través del repositorio
        const nuevoPrestamo = await this.equipmentLoanRepository.create({
            ...data,
            status: 'Loaned', // Estado por defecto
        });

        return nuevoPrestamo;
    }
}