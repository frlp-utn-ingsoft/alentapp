import { LockerDTO, CreateLockerRequest } from '@alentapp/shared';
import { LockerRepository } from '../domain/LockerRepository.js';
// Son la reglas que se deben complir impuestan es el tdd
export class CreateLockerUseCase {
    constructor(private readonly lockerRepository: LockerRepository) {}

    async execute(data: CreateLockerRequest): Promise<LockerDTO> {
        // Valida que los campos requeridos estén presentes
        if (!data.numero || !data.ubicacion) {
            throw new Error('Faltan campos requeridos');
        }

        // Valida que no se supere el límite de 100 lockers
        const total = await this.lockerRepository.count();
        if (total >= 100) {
            throw new Error('Se alcanzó el límite máximo de lockers');
        }

        // Valida que el número no esté ya registrado
        const existing = await this.lockerRepository.findByNumero(data.numero);
        if (existing) {
            throw new Error('Ya existe un locker con ese número');
        }

        // Crea el locker
        return this.lockerRepository.create(data);
    }
}