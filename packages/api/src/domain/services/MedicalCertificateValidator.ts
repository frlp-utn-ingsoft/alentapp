export class MedicalCertificateValidator {
  validateDates(issueDate?: Date, expiryDate?: Date) {
    if (issueDate && expiryDate && expiryDate <= issueDate) {
      throw new Error(
        'La fecha de vencimiento debe ser posterior a la de emisión'
      );
    }
  }

  validateDoctorLicense(doctorLicense?: string) {
    if (doctorLicense !== undefined && doctorLicense.trim() === '') {
      throw new Error('La matrícula del médico es obligatoria');
    }
  }
}