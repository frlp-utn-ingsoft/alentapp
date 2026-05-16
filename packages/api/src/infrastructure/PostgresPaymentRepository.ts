import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { IPaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDTO } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBPayment = {
    id: string;
    amount: { toString(): string };
    description: string | null;
    status: 'Pending' | 'Paid' | 'Canceled';
    paymentDate: Date;
    memberId: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export class PostgresPaymentRepository implements IPaymentRepository {
    async save(data: Omit<PaymentDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentDTO> {
        const payment = await prisma.payment.create({
            data: {
                amount: data.amount,
                description: data.description,
                status: data.status,
                paymentDate: new Date(data.paymentDate),
                memberId: data.memberId,
                deletedAt: null,
            },
        });
        return this.mapToDTO(payment);
    }

    async findAll(): Promise<PaymentDTO[]> {
        const payments = await prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return payments.map((p) => this.mapToDTO(p));
    }

    private mapToDTO(payment: DBPayment): PaymentDTO {
        return {
            id: payment.id,
            amount: parseFloat(payment.amount.toString()),
            description: payment.description,
            status: payment.status,
            paymentDate: payment.paymentDate.toISOString(),
            memberId: payment.memberId,
            deletedAt: payment.deletedAt ? payment.deletedAt.toISOString() : null,
            createdAt: payment.createdAt.toISOString(),
            updatedAt: payment.updatedAt.toISOString(),
        };
    }
}
