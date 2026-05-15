type MedicalCertificateDTO = {
  id: string;
  issue_date: Date | string;
  expiry_date: Date | string;
  doctor_license: string;
  is_validated: boolean;
  member_id: string;
};

type CreateMedicalCertificateRequest = {
  member_id: string;
  issue_date: Date;
  expiry_date: Date;
  doctor_license: string;
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const medicalCertificatesService = {
  async getAll(): Promise<MedicalCertificateDTO[]> {
    const response = await fetch(`${API_URL}/medical-certificates`);
    if (!response.ok) {
      throw new Error('Error al obtener los certificados medicos');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
    const response = await fetch(`${API_URL}/medical-certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el certificado medico');
    }
    const result = await response.json();
    return result.data;
  },
};
