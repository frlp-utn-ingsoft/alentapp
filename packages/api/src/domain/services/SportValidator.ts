export class SportValidator {
    validateCupoMaximo(nuevoCupo: number, inscriptosActualmente: number): void {
        if (nuevoCupo <= 0) {
            throw new Error('El cupo debe ser mayor a cero');
        }

        if (nuevoCupo < inscriptosActualmente) {
            throw new Error(`No se puede reducir el cupo por debajo de los ${inscriptosActualmente} socios ya inscriptos`);
        }
    }
}
