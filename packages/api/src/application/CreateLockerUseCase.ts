import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDTO, CreateLockerRequest } from '@alentapp/shared';

export class CreateLockerUseCase {
    constructor(
        private readonly lockerRepository: LockerRepository,
    ) {}

    async execute(data: CreateLockerRequest): Promise<LockerDTO> {
        // Regla de negocio: el número de casillero debe ser único
        const exists = await this.lockerRepository.existsByNumber(data.number);
        if (exists) {
            throw new Error(`Ya existe un casillero con el número ${data.number}`);
        }

        // Regla de negocio: validar estado inicial permitido
        const validStatuses = ['Available', 'Maintenance'];
        if (!validStatuses.includes(data.status)) {
            throw new Error(`Estado inválido. Los estados permitidos son: Available, Maintenance`);
        }

        // Persistencia — member_id nulo por defecto (el save lo garantiza)
        const nuevoLocker = await this.lockerRepository.save(data);

        return nuevoLocker;
    }
}