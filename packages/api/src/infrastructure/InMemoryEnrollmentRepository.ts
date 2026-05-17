import { randomUUID } from 'node:crypto';
import { CreateEnrollmentRequest, EnrollmentDTO } from '@alentapp/shared';
import { EnrollmentRepository } from '../domain/EnrollmentRepository.js';

export class InMemoryEnrollmentRepository implements EnrollmentRepository {
  private enrollments: EnrollmentDTO[] = [];

  async create(data: CreateEnrollmentRequest): Promise<EnrollmentDTO> {
    const enrollment: EnrollmentDTO = {
      id: randomUUID(),
      member_id: data.member_id,
      sport_id: data.sport_id,
      enrollment_date: data.enrollment_date ?? new Date().toISOString(),
      is_active: true,
    };
    this.enrollments.unshift(enrollment);
    return enrollment;
  }

  async findAll(): Promise<EnrollmentDTO[]> {
    return [...this.enrollments];
  }

  async findById(id: string): Promise<EnrollmentDTO | null> {
    return this.enrollments.find((enrollment) => enrollment.id === id) ?? null;
  }

  async existsBySportId(sportId: string): Promise<boolean> {
    return this.enrollments.some((enrollment) => enrollment.sport_id === sportId);
  }

  async existsByMemberAndSport(memberId: string, sportId: string): Promise<boolean> {
    return this.enrollments.some(
      (enrollment) => enrollment.member_id === memberId && enrollment.sport_id === sportId,
    );
  }

  async delete(id: string): Promise<void> {
    this.enrollments = this.enrollments.filter((enrollment) => enrollment.id !== id);
  }
}
