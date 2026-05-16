import { PaymentDTO } from "@alentapp/shared";
import { PaymentRepository } from "../domain/PaymentRepository.ts";

export class GetPaymentsUseCase {
    constructor(private paymentRepository: PaymentRepository) { }

    async execute(): Promise<PaymentDTO[]> {
        return await this.paymentRepository.findAll();
    }
}
