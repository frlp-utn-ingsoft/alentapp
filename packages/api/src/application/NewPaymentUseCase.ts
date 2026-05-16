import { PaymentRepository } from '../domain/PaymentRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { CreatePaymentRequest, PaymentDTO } from '@alentapp/shared';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';

export class CreatePaymentUseCase {
    constructor(
        private paymentRepository: PaymentRepository,
        private memberRepository: MemberRepository
    ) {}

    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        // 1. Validar campos obligatorios
        if (!data.member_id || !data.amount || !data.month || !data.year || !data.due_date) {
            throw new Error('Faltan campos obligatorios');
        }

        // 2. Validar que el monto sea positivo
        PaymentValidator.validateAmount(data.amount);

        // 3. Validar que el socio exista realmente (Regla del TDD-0013)
        const memberExists = await this.memberRepository.findById(data.member_id);
        if (!memberExists) {
            throw new Error('El socio especificado no existe');
        }

        // 4. Crear el pago (el status 'Pending' se asume en la infraestructura)
        return this.paymentRepository.create(data);
    }
}