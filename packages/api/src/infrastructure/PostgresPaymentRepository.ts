// packages/api/src/infrastructure/PostgresPaymentRepository.ts

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { PaymentRepository } from '../application/NewPaymentUseCase.js';
import { Payment } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

export class PostgresPaymentRepository implements PaymentRepository {
  
  public async memberExists(memberId: string): Promise<boolean> {
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });
    return member !== null;
  }

  // Acá hacemos la busqueda de payments duplicados
  public async findByMemberAndPeriod(memberId: string, month: number, year: number): Promise<Payment | null> {
    const payment = await prisma.payment.findFirst({
      where: {
        member_id: memberId,
        month: month,
        year: year
      }
    });
    
    return payment as any;
  }

  public async create(payment: Payment): Promise<Payment> {
    const p = payment as any;

    const createdPayment = await prisma.payment.create({
      data: {
        id: p.id,
        amount: p.amount,
        month: p.month,
        year: p.year,
        status: p.status,
        due_date: p.dueDate || p.due_date,
        member_id: p.memberId || p.member_id
         
        // use su @default(now()) nativo sin chocar con TypeScript.
      }
    });

    return createdPayment as any;
  }
}