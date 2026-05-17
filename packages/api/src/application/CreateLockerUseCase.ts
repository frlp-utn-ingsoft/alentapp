import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import { CreateLockerRequest, LockerDTO } from '@alentapp/shared';

export class CreateLockerUseCase {
    constructor(
        private readonly lockerRepository: LockerRepository,
        private readonly lockerValidator: LockerValidator
    ) {}

    async execute(data: CreateLockerRequest): Promise<LockerDTO> {

        this.lockerValidator.validateRequiredFields(data);
        this.lockerValidator.validateNumber(data.number);
        this.lockerValidator.validateLocation(data.location);
        await this.lockerValidator.validateUniqueNumber(data.number);

        return this.lockerRepository.create({
            number: data.number,
            location: data.location,
            status: 'AVAILABLE',
            member_id: null,
            contract_end_date: null,
        });
    }
}