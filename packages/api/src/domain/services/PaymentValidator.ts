// Servicio de Dominio con reglas de validación puras sobre pagos.

import { Clock } from "../Clock.js";

export class PaymentValidator {
    constructor(private readonly clock: Clock) {}

    private static readonly UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    validateUuid(id: string, fieldName: string = 'id'): void {
        if (typeof id !== 'string' || !PaymentValidator.UUID_REGEX.test(id)) {
            throw new Error(`Formato de ${fieldName} inválido`);
        }
    }

    validateAmount(amount: unknown): void {
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            throw new Error('Monto inválido');
        }
    }

    /**
     * Valida que la fecha esté en ISO 8601 y devuelve el Date parseado.
     * No valida la regla "futura": para eso usar `validateDueDateIsFuture`.
     */
    parseDueDate(due_date: unknown): Date {
        if (typeof due_date !== 'string') {
            throw new Error('Formato de fecha inválido');
        }
        // ISO 8601: acepta YYYY-MM-DD o con tiempo. Validamos ambas variantes.
        const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
        const isoFull = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
        if (!isoDateOnly.test(due_date) && !isoFull.test(due_date)) {
            throw new Error('Formato de fecha inválido');
        }
        const parsed = new Date(due_date);
        if (isNaN(parsed.getTime())) {
            throw new Error('Formato de fecha inválido');
        }
        return parsed;
    }

    /**
     * Valida que la fecha sea estrictamente posterior al día actual (a nivel de día).
     * No permite cargar pagos retroactivos ni con vencimiento hoy.
     */
    validateDueDateIsFuture(due_date: Date): void {
        const today = this.clock.now();
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
        const dueUtc = Date.UTC(
            due_date.getUTCFullYear(),
            due_date.getUTCMonth(),
            due_date.getUTCDate(),
        );
        if (dueUtc <= todayUtc) {
            throw new Error('La fecha de vencimiento debe ser futura');
        }
    }

    /**
     * Extrae el mes (1-12) y año a partir de una due_date.
     */
    extractPeriod(due_date: Date): { month: number; year: number } {
        return {
            month: due_date.getUTCMonth() + 1,
            year: due_date.getUTCFullYear(),
        };
    }
}
