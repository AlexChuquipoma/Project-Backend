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
    responseMessage?: string;
    date: string;
    time: string;
    modality: 'VIRTUAL' | 'PRESENCIAL';
    scheduleId?: number;
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

    console.log("Creating advisory with payload:", data);

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
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories/programmer/${programmerId}`, {
        headers: {
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        }
    });

    if (!response.ok) {
        console.error("Error fetching programmer advisories", await response.text());
        return [];
    }
    const json = await response.json();
    console.log("Programmer Advisories:", json);
    return json;
}

/**
 * Get advisories for the current user
 */
export async function getAdvisoriesByUser(userId: number): Promise<Advisory[]> {
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories/user/${userId}`, {
        headers: {
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        }
    });

    if (!response.ok) {
        console.error("Error fetching user advisories", await response.text());
        return [];
    }
    const json = await response.json();
    console.log("User Advisories:", json);
    return json;
}

/**
 * Update advisory status (ACCEPTED, REJECTED, COMPLETED)
 */
export async function updateAdvisoryStatus(id: number, status: string, responseMessage?: string): Promise<Advisory> {
    const user = getUser();
    let url = `${API_BASE_URL}/api/advisories/${id}/status?status=${status}`;
    if (responseMessage) {
        url += `&responseMessage=${encodeURIComponent(responseMessage)}`;
    }
    const response = await fetch(url, {
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
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories/stats/programmer/${programmerId}`, {
        headers: {
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        }
    });

    if (!response.ok) {
        return { total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, virtual: 0, presencial: 0 };
    }
    return response.json();
}

/**
 * Get stats for user dashboard charts
 */
export async function getUserStats(userId: number): Promise<AdvisoryStats> {
    const user = getUser();
    const response = await fetch(`${API_BASE_URL}/api/advisories/stats/user/${userId}`, {
        headers: {
            ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
        }
    });

    if (!response.ok) {
        return { total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0, virtual: 0, presencial: 0 };
    }
    return response.json();
}
