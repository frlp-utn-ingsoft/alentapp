import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDTO, CreatePaymentRequest } from '@alentapp/shared';

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
    async create(data: CreatePaymentRequest): Promise<PaymentDTO> {
        const payment = await prisma.payment.create({
            data: {
                amount: data.amount,
                month: data.month,
                year: data.year,
                due_date: new Date(data.due_date),
                member_id: data.member_id,
                // status es 'Pending' por defecto en Prisma
            },
        });
        return this.mapToDTO(payment);
    }

    async findById(id: string): Promise<PaymentDTO | null> {
        const payment = await prisma.payment.findUnique({
            where: { id },
        });
        return payment ? this.mapToDTO(payment) : null;
    }

    async findAll(): Promise<PaymentDTO[]> {
        const payments = await prisma.payment.findMany({
            orderBy: { due_date: 'desc' },
        });
        return payments.map(this.mapToDTO);
    }

    private mapToDTO(payment: DBPayment): PaymentDTO {
        return {
            id: payment.id,
            amount: payment.amount,
            month: payment.month,
            year: payment.year,
            status: payment.status,
            due_date: payment.due_date.toISOString().split('T')[0],
            payment_date: payment.payment_date ? payment.payment_date.toISOString() : undefined,
            member_id: payment.member_id,
        };
    }
}