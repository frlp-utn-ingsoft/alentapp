import { CreateDisciplineRequest } from '@alentapp/shared';

export class DisciplineValidator {
    validateRequiredFields(data: Partial<CreateDisciplineRequest> | undefined): void {
        if (
            !data ||
            typeof data.reason !== 'string' ||
            typeof data.startDate !== 'string' ||
            typeof data.endDate !== 'string' ||
            typeof data.isTotalSuspension !== 'boolean' ||
            typeof data.memberId !== 'string'
        ) {
            throw new Error('Faltan campos requeridos');
        }
    }

    validateReason(reason: string): void {
        if (!reason || reason.trim().length === 0) {
            throw new Error('El motivo de la sancion es obligatorio');
        }
    }

    validateDates(startDate: string, endDate: string): void {
        const start = this.parseValidDate(startDate);
        const end = this.parseValidDate(endDate);

        if (!start || !end) {
            throw new Error('Las fechas ingresadas no son validas');
        }

        if (end <= start) {
            throw new Error('La fecha de fin debe ser posterior a la de inicio');
        }
    }

    validateTotalSuspension(isTotalSuspension: unknown): void {
        if (typeof isTotalSuspension !== 'boolean') {
            throw new Error('Faltan campos requeridos');
        }
    }

    validateDisciplineId(id: string): void {
        if (!this.isValidUuid(id)) {
            throw new Error('El id de la sancion no es valido');
        }
    }

    validateReportedId(id: string): void {
        if (!this.isValidUuid(id)) {
            throw new Error('El id informado no es valido');
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
