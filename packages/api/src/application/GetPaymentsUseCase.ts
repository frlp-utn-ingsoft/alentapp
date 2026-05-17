
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDTO } from '@alentapp/shared';

export class GetPaymentsUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly validator: PaymentValidator,
    ) {}

    async execute(filters?: { member_id?: string }): Promise<PaymentDTO[]> {
        if (filters?.member_id) {
            this.validator.validateUuid(filters.member_id, 'member_id');
            return this.paymentRepo.findByMemberId(filters.member_id);
        }
        return this.paymentRepo.findAll();
    }
}