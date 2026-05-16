import { CreatePaymentRequest, PaymentDTO } from "@alentapp/shared";
import { PaymentRepository } from "../domain/PaymentRepository.ts";
import { MemberRepository } from "../domain/MemberRepository.ts";

export class CreatePaymentUseCase {
    constructor(
        private paymentRepository: PaymentRepository,
        private memberRepository: MemberRepository
    ) { }

    async execute(request: CreatePaymentRequest): Promise<PaymentDTO> {
        // 1. Validar que el socio existe
        const member = await this.memberRepository.findById(request.member_id);

        if (!member) {
            throw new Error('Error: El socio especificado no existe');
        }

        // 2. Validaciones de montos y fechas (Reglas de negocio del TDD)
        if (request.amount <= 0) {
            throw new Error('Error: El monto debe ser mayor a cero');
        }

        if (request.month < 1 || request.month > 12) {
            throw new Error('Error: Mes inválido. Debe estar entre 1 y 12');
        }

        if (request.year < 1900 || request.year > 2100) {
            throw new Error('Error: Año inválido. Debe estar entre 1900 y 2100');
        }

        // 3. Persistir el pago
        return await this.paymentRepository.create(request);

    }
}