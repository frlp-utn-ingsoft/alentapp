import { LoanRepository } from '../domain/LoanRepository.js';
import { GetLoansQuery, LoanWithMemberDTO } from '@alentapp/shared';

export class GetLoansUseCase {
    constructor(private readonly loanRepo: LoanRepository) {}

    async execute(query: GetLoansQuery): Promise<LoanWithMemberDTO[]> {
        return this.loanRepo.findAll(query);
    }
}