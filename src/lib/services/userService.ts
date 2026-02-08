import { getUser, setUser } from '../utils/localStorage';
import type { User } from '../../types/user.types';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

export interface UpdateUserData {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
}

/**
 * Get current user details from backend
 * (Includes fields not present in login response like createdAt, updatedAt)
 */
export async function getMyUser(): Promise<User> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();

    // Update local storage with fresh data (preserving token if backend doesn't return it)
    const updatedUser: User = {
        ...user,
        ...userData,
        role: userData.role ? userData.role.toLowerCase() : user.role,
        token: user.token // Ensure token is kept
    };

    setUser(updatedUser);
    return updatedUser;
}

/**
 * Update user profile (name, password)
 */
export async function updateUser(data: UpdateUserData): Promise<User> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update profile');
    }

    const updatedData = await response.json();

    const updatedUser: User = {
        ...user,
        ...updatedData,
        role: updatedData.role ? updatedData.role.toLowerCase() : user.role,
        token: user.token
    };

    setUser(updatedUser);
    return updatedUser;
}

/**
 * Upload profile image
 */
export async function updateProfileImage(file: File): Promise<User> {
    const user = getUser();

    if (!user || !user.token) {
        throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/users/me/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            // Content-Type is set automatically with boundary for FormData
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const updatedData = await response.json();

    const updatedUser: User = {
        ...user,
        ...updatedData,
        role: updatedData.role ? updatedData.role.toLowerCase() : user.role,
        token: user.token
    };

    setUser(updatedUser);
    return updatedUser;
}
