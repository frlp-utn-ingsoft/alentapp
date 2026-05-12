import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class InMemoryEnrollmentRepository implements EnrollmentRepository {
  async existsBySportId(_sportId: string): Promise<boolean> {
    return false;
  }
}
