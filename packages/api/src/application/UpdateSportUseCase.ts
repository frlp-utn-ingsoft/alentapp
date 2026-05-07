import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO, UpdateSportRequest } from '@alentapp/shared';

export class UpdateSportUseCase {
    constructor(
        private readonly sportRepo: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(id: string, data: UpdateSportRequest & Record<string, unknown>): Promise<SportDTO> {
        // 1. Verificar que el deporte existe y está activo
        const existing = await this.sportRepo.findActiveById(id);
        if (!existing) {
            throw new Error('No existe un deporte con ese ID');
        }

        // 2. Rechazar si intentan modificar el nombre (inmutabilidad)
        this.sportValidator.validateNameNotInPayload(data);

        // 3. Validar que haya al menos un campo para actualizar
        const allowedFields: (keyof UpdateSportRequest)[] = ['description', 'max_capacity', 'additional_price', 'requires_medical_certificate'];
        const hasUpdatableField = allowedFields.some(f => f in data);
        if (!hasUpdatableField) {
            throw new Error('No hay datos para actualizar');
        }

        // 4. Validaciones de negocio sobre los campos enviados
        if (data.max_capacity !== undefined) {
            this.sportValidator.validateMaxCapacity(data.max_capacity);
        }

        if (data.additional_price !== undefined) {
            this.sportValidator.validateAdditionalPrice(data.additional_price);
        }

        // 5. Construir objeto de actualización solo con campos permitidos
        const updateData: UpdateSportRequest = {};
        if ('description' in data) updateData.description = data.description as string | null;
        if ('max_capacity' in data) updateData.max_capacity = data.max_capacity;
        if ('additional_price' in data) updateData.additional_price = data.additional_price;
        if ('requires_medical_certificate' in data) updateData.requires_medical_certificate = data.requires_medical_certificate;

        return this.sportRepo.update(id, updateData);
    }
}
