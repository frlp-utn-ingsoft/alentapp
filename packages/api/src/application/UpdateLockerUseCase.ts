import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDTO, UpdateLockerRequest } from '@alentapp/shared';

export class UpdateLockerUseCase {
    constructor(private readonly lockerRepository: LockerRepository) {}

    async execute(id: string, data: UpdateLockerRequest): Promise<LockerDTO> {
        // Verificar que el casillero existe
        const locker = await this.lockerRepository.findById(id);
        if (!locker) {
            throw new Error(`El casillero con id ${id} no existe`);
        }

        // Regla de negocio: no se puede asignar un socio si el status es Maintenance
        const resultingStatus = data.status ?? locker.status;
        const resultingMemberId = data.member_id !== undefined ? data.member_id : locker.member_id;

        if (resultingStatus === 'Maintenance' && resultingMemberId !== null) {
            throw new Error(`Un casillero en mantenimiento no puede tener un socio asignado`);
        }

        // Validar unicidad del número si se está modificando
        if (data.number !== undefined && data.number !== locker.number) {
            const exists = await this.lockerRepository.existsByNumber(data.number);
            if (exists) {
                throw new Error(`Ya existe un casillero con el número ${data.number}`);
            }
        }

        // Validar estado permitido
        const validStatuses = ['Available', 'Occupied', 'Maintenance'];
        if (data.status && !validStatuses.includes(data.status)) {
            throw new Error(`Estado inválido. Los estados permitidos son: Available, Occupied, Maintenance`);
        }

        // Validar que el socio no tenga ya un casillero asignado
        if (data.member_id && data.member_id !== locker.member_id) {
            const existingLocker = await this.lockerRepository.findByMemberId(data.member_id);
            if (existingLocker) {
                throw new Error(`El socio ya tiene un casillero asignado (N° ${existingLocker.number})`);
            }
        }

        return await this.lockerRepository.update(id, data);
    }
}