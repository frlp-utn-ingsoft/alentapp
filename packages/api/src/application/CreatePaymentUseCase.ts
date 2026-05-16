import { IPaymentRepository } from '../domain/PaymentRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';

export class CreatePaymentUseCase {
    constructor(
        private readonly paymentRepository: IPaymentRepository,
        private readonly memberRepository: MemberRepository,
    ) {}

    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        if (typeof data.amount !== 'number' || isNaN(data.amount)) {
            throw new Error('El monto debe ser un valor numérico');
        }
        if (data.amount <= 0) {
            throw new Error('El monto debe ser mayor a cero');
        }
        if (!data.paymentDate || isNaN(new Date(data.paymentDate).getTime())) {
            throw new Error('La fecha de pago es inválida o está ausente');
        }
        const member = await this.memberRepository.findById(data.memberId);
        if (!member) {
            throw new Error('El socio indicado no existe');
        }

        return this.paymentRepository.save({
            amount: data.amount,
            description: data.description ?? null,
            status: 'Pending',
            paymentDate: data.paymentDate,
            memberId: data.memberId,
            deletedAt: null,
        });
    }
}
