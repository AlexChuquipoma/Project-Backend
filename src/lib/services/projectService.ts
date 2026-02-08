import { getUser } from '../utils/localStorage';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

export interface Project {
    id: number;
    userId: number;
    name: string;
    description: string;
    type: string;
    techs: string[];
    repoUrl: string;
    deployUrl: string;
    imageUrl?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProjectData {
    name: string;
    description: string;
    type: string;
    techs: string[];
    repoUrl: string;
    deployUrl: string;
    imageUrl?: string;
    role?: string;
}

/**
 * Get all my projects (requires authentication)
 */
export async function getMyProjects(): Promise<Project[]> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/projects/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch projects: ${error}`);
    }

    return response.json();
}

/**
 * Create a new project (requires authentication)
 */
export async function createProject(data: CreateProjectData): Promise<Project> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create project: ${error}`);
    }

    return response.json();
}

/**
 * Update an existing project (requires authentication)
 */
export async function updateProject(id: number, data: Partial<CreateProjectData>): Promise<Project> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update project: ${error}`);
    }

    return response.json();
}

/**
 * Delete a project (requires authentication)
 */
export async function deleteProject(id: number): Promise<void> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete project: ${error}`);
    }
}

/**
 * Get projects by user ID (public, no auth required)
 */
export async function getProjectsByUserId(userId: number): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects/user/${userId}`);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch user projects: ${error}`);
    }

    return response.json();
}
