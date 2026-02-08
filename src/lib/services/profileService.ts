import type { User } from '../../types/user.types';
import { getUser } from '../utils/localStorage';

// Backend API URL (Producción en Render)
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

export interface ProgrammerProfile {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    jobTitle?: string;
    bio?: string;
    imageUrl?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    yearsExperience?: number;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileData {
    jobTitle?: string;
    bio?: string;
    imageUrl?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    yearsExperience?: number;
}

/**
 * Get current user's profile (requires authentication)
 */
export async function getMyProfile(): Promise<ProgrammerProfile> {
    const user = getUser();
    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('PROFILE_NOT_FOUND');
        }
        const error = await response.text();
        throw new Error(`Failed to fetch profile: ${error}`);
    }

    return response.json();
}

/**
 * Get profile by user ID (public, no authentication required)
 */
export async function getProfileByUserId(userId: number): Promise<ProgrammerProfile> {
    const response = await fetch(`${API_BASE_URL}/api/profiles/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch profile: ${error}`);
    }

    return response.json();
}

/**
 * Get ALL programmer profiles (public, no authentication required)
 * Useful for displaying all programmers in the showcase/directory
 */
export async function getAllProfiles(): Promise<ProgrammerProfile[]> {
    const response = await fetch(`${API_BASE_URL}/api/profiles/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Failed to fetch all profiles:', error);
        return []; // Return empty array instead of throwing to prevent page from breaking
    }

    return response.json();
}

/**
 * Create or update profile (requires authentication)
 */
export async function createOrUpdateProfile(data: UpdateProfileData): Promise<ProgrammerProfile> {
    const user = getUser();
    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create/update profile: ${error}`);
    }

    return response.json();
}

/**
 * Update profile (alias for createOrUpdateProfile)
 */
export async function updateProfile(data: UpdateProfileData): Promise<ProgrammerProfile> {
    return createOrUpdateProfile(data);
}

/**
 * Delete profile (requires authentication)
 */
export async function deleteProfile(): Promise<void> {
    const user = getUser();
    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${user.token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete profile: ${error}`);
    }
}
