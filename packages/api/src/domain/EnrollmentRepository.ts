import { EnrollmentDTO, UpdateEnrollmentRequest } from '@alentapp/shared';

// Puerto de Salida: define las operaciones de persistencia para Enrollment.

export interface EnrollmentRepository {
  create(data: { member_id: string; sport_id: string }): Promise<EnrollmentDTO>;
  findById(id: string): Promise<EnrollmentDTO | null>;
  findByMemberAndSport(memberId: string, sportId: string): Promise<EnrollmentDTO | null>;
  findAll(): Promise<EnrollmentDTO[]>;
  update(id: string, data: UpdateEnrollmentRequest): Promise<EnrollmentDTO>;
  delete(id: string): Promise<void>;
  countActiveBySport(sportId: string): Promise<number>;
}
