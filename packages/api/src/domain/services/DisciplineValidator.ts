export class DisciplineValidator {
    validateDates(fechaInicio: string, fechaFin: string): void {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (fin <= inicio) {
            throw new Error('La fecha de fin debe ser estrictamente posterior a la fecha de inicio');
        }
    }

    validateMotivo(motivo: string): void {
        if (!motivo || motivo.trim().length === 0) {
            throw new Error('El motivo es obligatorio');
        }
    }
}
