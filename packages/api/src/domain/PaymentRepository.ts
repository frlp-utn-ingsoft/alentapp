import { PaymentDTO } from '@alentapp/shared';

export interface CreatePaymentData {
    member_id: string;
    amount: number;
    month: number;
    year: number;
    due_date: string; // ISO Date String
}

export interface UpdatePaymentData {
    amount?: number;
    due_date?: string; // ISO Date String
    month?: number;
    year?: number;
}

export interface PaymentRepository {
    create(data: CreatePaymentData): Promise<PaymentDTO>;
    findById(id: string): Promise<PaymentDTO | null>;
    findAll(): Promise<PaymentDTO[]>;
    findByMemberId(member_id: string): Promise<PaymentDTO[]>;


    existsActiveByMemberAndPeriod(
        member_id: string,
        month: number,
        year: number,
        excluding_payment_id?: string,
    ): Promise<boolean>;

    updateIfPending(id: string, data: UpdatePaymentData): Promise<PaymentDTO>;


    markAsPaidIfPending(id: string, payment_date: Date): Promise<PaymentDTO>;


    cancelIfPending(id: string, canceled_at: Date): Promise<PaymentDTO>;


    findExpiredPending(now: Date): Promise<PaymentDTO[]>;
}

export class PaymentNotPendingError extends Error {
    constructor(public readonly currentStatus: 'Pagado' | 'Cancelado') {
        super(`El pago ya no se encuentra en estado Pendiente (estado actual: ${currentStatus})`);
        this.name = 'PaymentNotPendingError';
    }
}
