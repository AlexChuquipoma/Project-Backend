import { getUser } from '../utils/localStorage';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

export interface Advisory {
    id?: number;
    programmerId: number;
    programmerName?: string;
    userId: number;
    userName?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
    message: string;
    date: string;
    time: string;
    modality: 'VIRTUAL' | 'PRESENCIAL';
}

export interface AdvisoryStats {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    virtual: number;
    presencial: number;
}

/**
 * Create a new advisory booking
 */
export async function createAdvisory(data: Partial<Advisory>): Promise<Advisory> {
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create advisory: ${error}`);
    }

    return response.json();
}

/**
 * Get advisories for a specific programmer
 */
export async function getAdvisoriesByProgrammer(programmerId: number): Promise<Advisory[]> {
    const response = await fetch(`${API_BASE_URL}/api/advisories/programmer/${programmerId}`);
    if (!response.ok) return [];
    return response.json();
}

/**
 * Get advisories for the current user
 */
export async function getAdvisoriesByUser(userId: number): Promise<Advisory[]> {
    const response = await fetch(`${API_BASE_URL}/api/advisories/user/${userId}`);
    if (!response.ok) return [];
    return response.json();
}

/**
 * Update advisory status (ACCEPTED, REJECTED, COMPLETED)
 */
export async function updateAdvisoryStatus(id: number, status: string): Promise<Advisory> {
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: {
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update status: ${error}`);
    }

    return response.json();
}

/**
 * Get stats for programmer dashboard charts
 */
export async function getProgrammerStats(programmerId: number): Promise<AdvisoryStats> {
    const response = await fetch(`${API_BASE_URL}/api/advisories/stats/programmer/${programmerId}`);
    if (!response.ok) {
        return { total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, virtual: 0, presencial: 0 };
    }
    return response.json();
}
