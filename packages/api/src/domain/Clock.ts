// Abstracción para obtener la fecha/hora actual.
// En producción se inyecta SystemClock; en tests, un mock con fecha fija.

export interface Clock {
    now(): Date;
}
