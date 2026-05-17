import { CreateMedicalCertificateRequest } from '@alentapp/shared';

export class MedicalCertificateValidator {
    validateRequiredFields(data: Partial<CreateMedicalCertificateRequest> | undefined): void {
        if (
            !data ||
            typeof data.memberId !== 'string' ||
            typeof data.issueDate !== 'string'
        ) {
            throw new Error('Faltan campos requeridos');
        }
    }

    validateMemberId(id: string): void {
        if (!this.isValidUuid(id)) {
            throw new Error('El id del socio no es válido');
        }
    }

    validateIssueDate(issueDate: string): void {
        const dt = this.parseValidDate(issueDate);
        if (!dt) throw new Error('La fecha de emisión no es válida');
    }

    validateExpirationDate(expirationDate: string | undefined, issueDate: string): void {
        if (!expirationDate) return;
        const exp = this.parseValidDate(expirationDate);
        const issue = this.parseValidDate(issueDate);
        if (!exp) throw new Error('La fecha de vencimiento no es válida');
        if (!issue) throw new Error('La fecha de emisión no es válida');
        if (exp <= issue) throw new Error('La fecha de vencimiento debe ser posterior a la de emisión');
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
