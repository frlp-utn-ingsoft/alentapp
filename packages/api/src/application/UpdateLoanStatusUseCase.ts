import { LoanRepository } from '../domain/LoanRepository.js';
import { LoanDTO, UpdateLoanStatusRequest } from '@alentapp/shared';

export class UpdateLoanStatusUseCase {
    constructor(private readonly loanRepo: LoanRepository) {}

    async execute(id: string, data: UpdateLoanStatusRequest): Promise<LoanDTO> {
        const loan = await this.loanRepo.findById(id);
        if (!loan) {
            throw new Error('No se encontró el registro del préstamo');
        }

        if (loan.status === 'Returned') {
            throw new Error('El préstamo ya fue marcado como devuelto anteriormente');
        }

        return this.loanRepo.updateStatus(id, data);
    }
}