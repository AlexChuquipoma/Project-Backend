// API Configuration
// When Spring Boot backend is ready, update the API_BASE_URL

export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com/api';

export const API_ENDPOINTS = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        logout: `${API_BASE_URL}/auth/logout`,
        me: `${API_BASE_URL}/auth/me`,
    },
    projects: {
        getAll: `${API_BASE_URL}/projects`,
        getById: (id: string) => `${API_BASE_URL}/projects/${id}`,
        getByUser: (userId: string) => `${API_BASE_URL}/projects/user/${userId}`,
        create: `${API_BASE_URL}/projects`,
        update: (id: string) => `${API_BASE_URL}/projects/${id}`,
        delete: (id: string) => `${API_BASE_URL}/projects/${id}`,
    },
    advisories: {
        getAll: `${API_BASE_URL}/advisories`,
        getMy: `${API_BASE_URL}/advisories/my`,
        create: `${API_BASE_URL}/advisories`,
        update: (id: string) => `${API_BASE_URL}/advisories/${id}`,
    },
    users: {
        getProgrammers: `${API_BASE_URL}/users/programmers`,
        getById: (id: string) => `${API_BASE_URL}/users/${id}`,
    },
};

// Helper function for API calls with auth token
export async function apiCall<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const user = localStorage.getItem('ciber_user');
    const token = user ? JSON.parse(user).token : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}
