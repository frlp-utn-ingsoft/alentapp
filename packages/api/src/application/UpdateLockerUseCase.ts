import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDTO, LockerStatus } from '@alentapp/shared';
import { MemberRepository } from '../domain/MemberRepository.js';

type UpdateLockerRequest = {
    status?: LockerStatus;
    member_id?: string | null;
    contract_end_date?: string | null;
};

export class UpdateLockerUseCase {
constructor(
    private readonly lockerRepo: LockerRepository,
    private readonly memberRepo: MemberRepository
) {}

async execute(id: string, data: UpdateLockerRequest): Promise<LockerDTO> {
    const locker = await this.lockerRepo.findById(id);

    if (!locker) {
    throw new Error('El locker no existe');
    }

    // validar estado
if (
    data.status &&
    !['AVAILABLE', 'MAINTENANCE'].includes(data.status)
) {
    throw new Error('Estado inválido');
}

    // no asignar en mantenimiento
if (
    locker.status === 'MAINTENANCE' &&
    data.member_id &&
    locker.member_id !== data.member_id
) {
    throw new Error('El locker está en mantenimiento');
}

// evitar doble asignación
if (
    data.member_id &&
    locker.member_id &&
    locker.member_id !== data.member_id
) {
    throw new Error('El locker ya se encuentra asignado');
}

    // validar socio existente
    if (data.member_id) {
    const member = await this.memberRepo.findById(data.member_id);
    if (!member) {
        throw new Error('El socio no existe');
    }
    }

    if (data.contract_end_date && !data.member_id && !locker.member_id) {
    throw new Error(
        'No se puede asignar fecha de contrato sin socio'
    );
}

    const updated: any = { ...data };

// MANTENIMIENTO
        if (data.status === 'MAINTENANCE') {
            updated.status = 'MAINTENANCE';

            return this.lockerRepo.update(id, updated);
        }

// ASIGNAR
    if (data.member_id) {
    updated.status = 'OCCUPIED';
    }

// LIBERAR
if (data.member_id === null) {
    updated.status = 'AVAILABLE';
    updated.member_id = null;
    updated.contract_end_date = null;
}

    return this.lockerRepo.update(id, updated);
}
}