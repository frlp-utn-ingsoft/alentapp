import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';

export class CreatePaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly paymentValidator: PaymentValidator
    ) {}

    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        // 1. Validaciones
        this.paymentValidator.validateAmount(data.amount);
        this.paymentValidator.validateMonth(data.month);
        this.paymentValidator.validateYear(data.year);
        await this.paymentValidator.validateMemberExists(data.member_id);

        // 2. Persistencia
        return this.paymentRepo.save({
            amount: data.amount,
            month: data.month,
            year: data.year,
            due_date: data.due_date,
            member_id: data.member_id
        });
    }
}
