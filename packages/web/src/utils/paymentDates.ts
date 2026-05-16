export function getPreviousMonthAndYear() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (currentMonth === 1) {
        return {
            month: 12,
            year: currentYear - 1,
        };
    }

    return {
        month: currentMonth - 1,
        year: currentYear,
    };
}

export function getDefaultDueDate(month: number, year: number) {
    if (
        !Number.isInteger(month) ||
        !Number.isInteger(year) ||
        month < 1 ||
        month > 12
    ) {
        return '';
    }

    const dueDate = new Date(year, month, 1);

    const yyyy = dueDate.getFullYear();
    const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dueDate.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(date: string | null) {
    if (!date) return 'No pagado';

    return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}