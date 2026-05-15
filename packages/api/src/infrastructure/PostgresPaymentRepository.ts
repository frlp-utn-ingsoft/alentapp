import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import type { CreatePaymentRequest, PaymentDTO, PaymentStatus } from '@alentapp/shared';
import type { PaymentRepository } from '../domain/PaymentRepository.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBPayment = {
    id: string;
    amount: number;
    month: number;
    year: number;
    status: PaymentStatus;
    due_date: Date;
    payment_date: Date | null;
    member_id: string;
    created_at: Date;
    updated_at: Date;
};

export class PostgresPaymentRepository implements PaymentRepository {
    async create(data: CreatePaymentRequest): Promise<PaymentDTO> {
        const payment = await prisma.payment.create({
            data: {
                amount: data.amount,
                month: data.month,
                year: data.year,
                due_date: new Date(data.due_date),
                member_id: data.member_id,
                status: data.status ?? 'Pending',
                payment_date: data.payment_date ? new Date(data.payment_date) : null,
            },
        });

        return this.mapToDTO(payment);
    }

    private mapToDTO(payment: DBPayment): PaymentDTO {
        return {
            id: payment.id,
            amount: payment.amount,
            month: payment.month,
            year: payment.year,
            status: payment.status,
            due_date: payment.due_date.toISOString().split('T')[0],
            payment_date: payment.payment_date ? payment.payment_date.toISOString() : null,
            member_id: payment.member_id,
            created_at: payment.created_at.toISOString(),
            updated_at: payment.updated_at.toISOString(),
        };
    }
}
