import { CreateSportRequest } from '@alentapp/shared';

export class SportValidator {
    // Valida que todos los campos obligatorios para crear un deporte estén presentes.
    validateRequiredFields(data: CreateSportRequest): void {
        if (
            !data.name?.trim() ||
            !data.description?.trim() ||
            data.max_capacity === undefined ||
            data.additional_price === undefined ||
            data.requires_medical_certificate === undefined
        ) {
            throw new Error('Todos los campos obligatorios deben estar presentes');
        }
    }

    // Valida que el cupo máximo sea válido.
    validateMaxCapacity(maxCapacity: number): void {
        if (!Number.isFinite(maxCapacity)) {
            throw new Error('El cupo máximo debe ser un número válido');
        }

        if (!Number.isInteger(maxCapacity)) {
            throw new Error('El cupo máximo debe ser un número entero');
        }

        if (maxCapacity <= 0) {
            throw new Error('El cupo máximo debe ser mayor a cero');
        }

        if (maxCapacity > 9999) {
            throw new Error('El cupo máximo es demasiado alto');
        }
    }

    // Valida que el precio adicional no sea negativo.
    validateAdditionalPrice(additionalPrice: number): void {
        if (!Number.isFinite(additionalPrice)) {
            throw new Error('El precio adicional debe ser un número válido');
        }

        if (additionalPrice < 0) {
            throw new Error('El precio adicional no puede ser negativo');
        }

        if (additionalPrice > 99999999) {
            throw new Error('El precio adicional es demasiado alto');
        }
    }
    
    // Valida que la descripción no quede vacía cuando se envía para actualizar.
    validateDescription(description: string): void {
        if (!description.trim()) {
            throw new Error('La descripción no puede estar vacía');
        }
    }
}