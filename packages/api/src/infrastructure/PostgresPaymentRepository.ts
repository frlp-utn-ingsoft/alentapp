import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { CreatePaymentRequest, PaymentResponse } from '@alentapp/shared';

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
    status: 'Pending' | 'Paid' | 'Canceled';
    due_date: Date;
    payment_date: Date | null;
    member_id: string;
};

export class PostgresPaymentRepository implements PaymentRepository {
    async create(data: CreatePaymentRequest): Promise<PaymentResponse> {
        const payment = await prisma.payment.create({
            data: {
                amount: data.amount,
                month: data.month,
                year: data.year,
                due_date: new Date(data.dueDate),
                member_id: data.memberId,
            },
        });

        return this.mapToDTO(payment);
    }

    private mapToDTO(payment: DBPayment): PaymentResponse {
        return {
            id: payment.id,
            amount: payment.amount,
            month: payment.month,
            year: payment.year,
            status: payment.status,
            dueDate: payment.due_date.toISOString(),
            paymentDate: payment.payment_date ? payment.payment_date.toISOString() : null,
            memberId: payment.member_id,
        };
    }
}
