import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
import { LoanRepository } from '../domain/LoanRepository.js';
import { CreateLoanRequest, LoanDTO, LoanStatus, LoanWithMemberDTO, GetLoansQuery, UpdateLoanStatusRequest } from '@alentapp/shared';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL),
});

type DBEquipmentLoan = {
    id: string;
    member_id: string;
    item_name: string;
    loan_date: Date;
    due_date: Date;
    status: string;
};

export class PostgresLoanRepository implements LoanRepository {
    async create(data: CreateLoanRequest): Promise<LoanDTO> {
        const loanDate = new Date();

        const loan = await prisma.equipmentLoan.create({
            data: {
                member_id: data.member_id,
                item_name: data.item_name,
                loan_date: loanDate,
                due_date: new Date(data.due_date),
                status: 'Loaned',
            },
        });

        return this.mapToDTO(loan);
    }

    async findById(id: string): Promise<LoanDTO | null> {
        const loan = await prisma.equipmentLoan.findUnique({
            where: { id },
        });

        return loan ? this.mapToDTO(loan) : null;
    }

    async findByMemberId(memberId: string): Promise<LoanDTO[]> {
        const loans = await prisma.equipmentLoan.findMany({
            where: { member_id: memberId },
            orderBy: { loan_date: 'desc' },
        });

        return loans.map(this.mapToDTO);
    }

    async findAll(query: GetLoansQuery): Promise<LoanWithMemberDTO[]> {
        const where: any = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.search) {
            where.OR = [
                { item_name: { contains: query.search, mode: 'insensitive' } },
                { member: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        const loans = await prisma.equipmentLoan.findMany({
            where,
            include: {
                member: {
                    select: { name: true },
                },
            },
            orderBy: { loan_date: 'desc' },
        });

        return loans.map(this.mapToDTOWithMember);
    }

    private mapToDTOWithMember(loan: DBEquipmentLoan & { member: { name: string } }): LoanWithMemberDTO {
        return {
            id: loan.id,
            member_id: loan.member_id,
            item_name: loan.item_name,
            loan_date: loan.loan_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            status: loan.status as LoanStatus,
            member: {
                name: loan.member.name,
            },
        };
    }

    private mapToDTO(loan: DBEquipmentLoan): LoanDTO {
        return {
            id: loan.id,
            member_id: loan.member_id,
            item_name: loan.item_name,
            loan_date: loan.loan_date.toISOString(),
            due_date: loan.due_date.toISOString(),
            status: loan.status as LoanStatus,
        };
    }

    async delete(id: string): Promise<void> {
        await prisma.equipmentLoan.delete({
            where: { id },
        });
    }

    async updateStatus(id: string, data: UpdateLoanStatusRequest): Promise<LoanDTO> {
        const loan = await prisma.equipmentLoan.update({
            where: { id },
            data: {
                status: data.status,
            },
        });

        return this.mapToDTO(loan);
    }
}