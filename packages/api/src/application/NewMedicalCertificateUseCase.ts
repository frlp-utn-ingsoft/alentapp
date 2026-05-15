import {CreateMedicalCertificateRequest, MedicalCertificateDTO,} from '@alentapp/shared';
import { MedicalCertificateRepository } from '../domain/MedicalCertificateRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';

export class CreateMedicalCertificateUseCase {
  constructor(
    private readonly medicalCertificateRepo: MedicalCertificateRepository,
    private readonly memberRepo: MemberRepository
  ) {}

  async execute(
    request: CreateMedicalCertificateRequest
  ): Promise<MedicalCertificateDTO> {
        // Validar matrícula médica
    if (!request.doctor_license || request.doctor_license.trim() === '') {
      throw new Error('La matrícula del médico es obligatoria');
    }

     // Validar fechas
    const issueDate = new Date(request.issue_date);
    const expiryDate = new Date(request.expiry_date);

    if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
      throw new Error('Las fechas ingresadas no son válidas');
    }

    if (expiryDate <= issueDate) {
      throw new Error(
        'La fecha de vencimiento debe ser posterior a la de emisión'
      );
    }

    // Validar socio existente
    const member = await this.memberRepo.findById(request.member_id);

    if (!member) {
      throw new Error('El socio indicado no se encuentra registrado');
    }
    // Invalidar certificado activo anterior
    const activeCertificate =
      await this.medicalCertificateRepo.findActiveByMemberId(
        request.member_id
      );

    if (activeCertificate) {
      await this.medicalCertificateRepo.invalidate(
        activeCertificate.id
      );
    }
    // Crear nuevo certificado
    const createdCertificate =
      await this.medicalCertificateRepo.createReplacingActive({
        member_id: request.member_id,
        issue_date: issueDate,
        expiry_date: expiryDate,
        doctor_license: request.doctor_license.trim(),
        is_validated: true,
      });

    return createdCertificate;
  }
}