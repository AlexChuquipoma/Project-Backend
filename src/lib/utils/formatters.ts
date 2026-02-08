// Date formatting
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d);
}

// Relative time (e.g., "hace 2 horas")
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} horas`;
    if (diffDays < 7) return `hace ${diffDays} días`;
    return formatDate(d);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Generate random ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
