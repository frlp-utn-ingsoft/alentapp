import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO, UpdateSportRequest } from '@alentapp/shared';

type RawUpdateSportRequest = UpdateSportRequest & {
    name?: unknown;
    deleted_at?: unknown;
};

export class UpdateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator,
    ) {}

    async execute(id: string, data: RawUpdateSportRequest): Promise<SportDTO> {
        // Regla propia de PATCH: no tiene sentido actualizar sin enviar campos.
        if (Object.keys(data).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        // Regla propia del caso de uso: el nombre no se modifica desde actualización.
        if ('name' in data) {
            throw new Error('El nombre del deporte no puede modificarse después de la creación');
        }

        // Regla propia del caso de uso: deleted_at solo se modifica mediante baja lógica.
        if ('deleted_at' in data) {
            throw new Error('La baja del deporte solo puede modificarse mediante la operación correspondiente');
        }

        // Verifica que el deporte exista.
        const existingSport = await this.sportRepository.findById(id);

        if (!existingSport) {
            throw new Error('El deporte no existe');
        }

        // Evita actualizar deportes dados de baja.
        if (existingSport.deleted_at !== null) {
            throw new Error('El deporte se encuentra dado de baja');
        }

        // Valida descripción solo si fue enviada.
        if (data.description !== undefined) {
            this.sportValidator.validateDescription(data.description);
        }

        // Valida cupo solo si fue enviado.
        if (data.max_capacity !== undefined) {
            this.sportValidator.validateMaxCapacity(data.max_capacity);
        }

        // Valida precio adicional solo si fue enviado.
        if (data.additional_price !== undefined) {
            this.sportValidator.validateAdditionalPrice(data.additional_price);
        }

        // Se arma un objeto solo con los campos editables permitidos.
        const updateData: UpdateSportRequest = {
            ...(data.description !== undefined && {
                description: data.description.trim(),
            }),
            ...(data.max_capacity !== undefined && {
                max_capacity: data.max_capacity,
            }),
            ...(data.additional_price !== undefined && {
                additional_price: data.additional_price,
            }),
            ...(data.requires_medical_certificate !== undefined && {
                requires_medical_certificate: data.requires_medical_certificate,
            }),
        };

        return this.sportRepository.update(id, updateData);
    }
}