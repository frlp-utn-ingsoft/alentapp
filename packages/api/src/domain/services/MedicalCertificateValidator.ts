export class MedicalCertificateValidator {
  validate(data: {
    memberId: string
    expiryDate: string
  }) {
    if (!data.memberId) {
      throw new Error("El campo memberId es obligatorio")
    }
    if (!data.expiryDate) {
      throw new Error("Formato de fecha inválido")
    }
    const expiryDate = new Date(data.expiryDate)
    if (isNaN(expiryDate.getTime())) {
      throw new Error("Formato de fecha inválido")
    }
    const issueDate = new Date()
    if (expiryDate <= issueDate) {
      throw new Error(
        "La fecha de vencimiento debe ser posterior a la de emisión"
      )
    }
  }
}