import { LockerRepository } from '../domain/LockerRepository.js';

export class DeleteLockerUseCase {
    constructor(private readonly lockerRepository: LockerRepository) {}

    async execute(id: string): Promise<void> {
        // Verificar que el casillero existe
        const locker = await this.lockerRepository.findById(id);
        if (!locker) {
            throw new Error(`El casillero con id ${id} no existe`);
        }

        // Regla de negocio: no se puede eliminar un casillero ocupado
        if (locker.status === 'Occupied') {
            throw new Error(`No se puede eliminar un casillero que está actualmente asignado a un socio`);
        }

        await this.lockerRepository.delete(id);
    }
}