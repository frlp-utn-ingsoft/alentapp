
import { CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';
import { MemberRepository } from '../MemberRepository.js';



export class DisciplineValidator {
    constructor(private readonly memberRepo: MemberRepository) {}

    validateRequiredFields(data: CreateDisciplineRequest): void {
        if (
            !data.reason ||
            !data.start_date ||
            !data.end_date ||
            data.is_total_suspension === undefined ||
            !data.member_id
        ) {
            throw new Error('Todos los campos son requeridos');
        }        
    }

    validateReason(reason: string): void {
        if (!reason || reason.trim().length === 0) {
            throw new Error('El motivo de la sanción es obligatorio');
        }
    }

    validateIsTotalSuspension(is_total_suspension: unknown): void {
        if (typeof is_total_suspension !== 'boolean') {
            throw new Error('El campo is_total_suspension debe ser booleano');
        }
    }

    validateDateFormat(date: string): void {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error('Formato de fecha inválido');
        }

        const year = parsedDate.getUTCFullYear();

        if (year < 1000 || year > 9999) {
            throw new Error('Formato de fecha inválido');
        }
    }

    validateEndDateAfterStartDate(start_date: string, end_date: string): void {
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (end <= start){
            throw new Error('La fecha de fin debe ser estrictamente posterior a la fecha de inicio');
        }
    }

    async validateMemberExists(member_id: string): Promise<void> {
        const member = await this.memberRepo.findById(member_id);
        if (!member) {
            throw new Error('El socio no existe');
        }
    }

    validateHasUpdateFields(data: UpdateDisciplineRequest): void {
        if (
            data.reason === undefined &&
            data.start_date === undefined &&
            data.end_date === undefined &&
            data.is_total_suspension === undefined
        ) {
            throw new Error('Debe enviarse al menos un campo para actualizar');
        }
    }
    validateMemberIdIsNotPresent(data: unknown): void {
        if (
            typeof data === 'object' &&
            data !== null &&
            'member_id' in data
        ) {
            throw new Error('No se permite modificar el socio asociado a la sanción');
        }
    }

    validateUpdateReason(reason?: string): void {
        if (reason !== undefined) {
            this.validateReason(reason);
        }
    }
    validateUpdateIsTotalSuspension(is_total_suspension?: unknown): void {
        if (is_total_suspension !== undefined) {
            this.validateIsTotalSuspension(is_total_suspension);
        }
    }
    validateUpdateDateFormat(date?: string): void {
        if (date !== undefined) {
            this.validateDateFormat(date);
        }
    }
    validateIdFormat(id: string): void {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(id)) {
            throw new Error('Formato de ID inválido');
        }
    }
}

