import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { Clock } from '../domain/Clock.js';
import { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';

// Errores específicos de la capa de aplicación. El controller los traduce a HTTP.
export class MemberNotFoundError extends Error {
    constructor() {
        super('El socio no existe');
        this.name = 'MemberNotFoundError';
    }
}
export class MemberNotActiveError extends Error {
    constructor() {
        super('No se puede generar el pago para un socio inactivo');
        this.name = 'MemberNotActiveError';
    }
}
export class DuplicateActivePaymentError extends Error {
    constructor() {
        super('Ya existe un pago activo para ese socio en ese período');
        this.name = 'DuplicateActivePaymentError';
    }
}

export class NewPaymentUseCase {
    constructor(
        private readonly paymentRepo: PaymentRepository,
        private readonly memberRepo: MemberRepository,
        private readonly validator: PaymentValidator,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        private readonly clock: Clock, // reservado por simetría con otros use cases
    ) {}

    async execute(data: CreatePaymentRequest): Promise<PaymentDTO> {
        // 1. Validaciones de formato y reglas puras
        this.validator.validateUuid(data.member_id, 'member_id');
        this.validator.validateAmount(data.amount);
        const parsedDueDate = this.validator.parseDueDate(data.due_date);
        this.validator.validateDueDateIsFuture(parsedDueDate);

        // 2. Validar existencia y estado del socio
        const member = await this.memberRepo.findById(data.member_id);
        if (!member) {
            throw new MemberNotFoundError();
        }
        // El socio debe estar habilitado para recibir pagos.
        // 'Activo' y 'Moroso' permiten; 'Suspendido' bloquea.
        if (member.status === 'Suspendido') {
            throw new MemberNotActiveError();
        }

        // 3. Derivar período
        const { month, year } = this.validator.extractPeriod(parsedDueDate);

        // 4. Verificar unicidad por período activo
        const exists = await this.paymentRepo.existsActiveByMemberAndPeriod(
            data.member_id,
            month,
            year,
        );
        if (exists) {
            throw new DuplicateActivePaymentError();
        }

        // 5. Persistir. El estado inicial 'Pendiente' lo aplica el schema (default).
        return this.paymentRepo.create({
            member_id: data.member_id,
            amount: data.amount,
            month,
            year,
            due_date: data.due_date,
        });
    }
}
