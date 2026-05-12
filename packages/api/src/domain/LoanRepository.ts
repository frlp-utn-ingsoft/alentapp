import { LoanDTO, CreateLoanRequest, LoanWithMemberDTO, GetLoansQuery, UpdateLoanStatusRequest } from '@alentapp/shared';

export interface LoanRepository {
  create(loan: CreateLoanRequest): Promise<LoanDTO>;
  findById(id: string): Promise<LoanDTO | null>;
  findByMemberId(memberId: string): Promise<LoanDTO[]>;
  findAll(query: GetLoansQuery): Promise<LoanWithMemberDTO[]>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, data: UpdateLoanStatusRequest): Promise<LoanDTO>;
}