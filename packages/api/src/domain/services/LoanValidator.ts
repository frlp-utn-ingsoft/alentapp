import { CreateLoanRequest } from '@alentapp/shared';

export class LoanValidator {
    validateRequiredFields(data: Partial<CreateLoanRequest> | undefined): void {
        if (
            !data ||
            typeof data.member_id !== 'string' ||
            typeof data.item_name !== 'string' ||
            typeof data.due_date !== 'string'
        ) {
            throw new Error('Faltan campos requeridos');
        }
    }

    validateItemName(itemName: string): void {
        if (!itemName || itemName.trim().length === 0) {
            throw new Error('El nombre del ítem es obligatorio');
        }
    }

    validateDueDate(dueDate: string, loanDate: Date): void {
        const due = this.parseValidDate(dueDate);

        if (!due) {
            throw new Error('La fecha de devolución no es válida');
        }

        if (due <= loanDate) {
            throw new Error('La fecha de devolución debe ser posterior a la de inicio');
        }
    }

    validateMemberId(memberId: string): void {
        if (!this.isValidUuid(memberId)) {
            throw new Error('El id del socio no es válido');
        }
    }

    private isValidUuid(id: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    }

    private parseValidDate(value: string): Date | null {
        const dateMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
        if (!dateMatch) {
            return null;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const year = Number(dateMatch[1]);
        const month = Number(dateMatch[2]);
        const day = Number(dateMatch[3]);
        const calendarDate = new Date(Date.UTC(year, month - 1, day));

        if (
            calendarDate.getUTCFullYear() !== year ||
            calendarDate.getUTCMonth() !== month - 1 ||
            calendarDate.getUTCDate() !== day
        ) {
            return null;
        }

        return date;
    }
}