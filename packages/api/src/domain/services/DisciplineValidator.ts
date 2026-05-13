export class DisciplineValidator {
  validateDates(start: Date, end: Date): void {
    if (end <= start) {
      throw new Error('La fecha de fin debe ser posterior a la de inicio');
    }
  }
}
