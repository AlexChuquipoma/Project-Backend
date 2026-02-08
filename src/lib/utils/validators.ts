// Email validation
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation (minimum 6 characters)
export function validatePassword(password: string): boolean {
    return password.length >= 6;
}

// Required field validation
export function validateRequired(value: string): boolean {
    return value.trim().length > 0;
}

// URL validation
export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Tech stack validation (comma-separated or array)
export function validateTechStack(techs: string | string[]): boolean {
    if (Array.isArray(techs)) {
        return techs.length > 0 && techs.every(t => t.trim().length > 0);
    }
    return techs.trim().length > 0;
}
