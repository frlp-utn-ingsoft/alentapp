import { CreateSportRequest } from '@alentapp/shared';

export class SportValidator {
    // Valida que todos los campos obligatorios para crear un deporte estén presentes.
    validateRequiredFields(data: CreateSportRequest): void {
        if (
            !data.name ||
            !data.description ||
            data.max_capacity === undefined ||
            data.additional_price === undefined ||
            data.requires_medical_certificate === undefined
        ) {
            throw new Error('Todos los campos obligatorios deben estar presentes');
        }
    }

    // Valida que el cupo máximo sea válido.
    validateMaxCapacity(maxCapacity: number): void {
        if (maxCapacity <= 0) {
            throw new Error('El cupo máximo debe ser mayor a cero');
        }
    }

    // Valida que el precio adicional no sea negativo.
    validateAdditionalPrice(additionalPrice: number): void {
        if (additionalPrice < 0) {
            throw new Error('El precio adicional no puede ser negativo');
        }
    }
}