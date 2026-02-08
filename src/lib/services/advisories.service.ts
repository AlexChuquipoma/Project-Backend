import type { Advisory, CreateAdvisoryData } from '../../types/advisory.types';
import { generateId } from '../utils/formatters';
import { getCurrentUser } from './auth.service';

// Mock advisories database
let MOCK_ADVISORIES: Advisory[] = [];

/**
 * Create new advisory request
 * TODO: Replace with actual API call to Spring Boot
 */
export async function createAdvisory(data: CreateAdvisoryData): Promise<Advisory> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión para solicitar asesorías');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock implementation
    const newAdvisory: Advisory = {
        id: generateId(),
        programmerId: data.programmerId,
        userId: user.id,
        userName: user.name,
        programmerName: 'Programmer Name', // This would come from the API
        status: 'pending',
        message: data.message,
        createdAt: new Date(),
    };

    MOCK_ADVISORIES.push(newAdvisory);
    return newAdvisory;
}

/**
 * Get all advisories (admin only)
 * TODO: Replace with actual API call to Spring Boot
 */
export async function getAllAdvisories(): Promise<Advisory[]> {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('No tienes permiso para ver todas las asesorías');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return MOCK_ADVISORIES;
}

/**
 * Get current user's advisories
 * TODO: Replace with actual API call to Spring Boot
 */
export async function getMyAdvisories(): Promise<Advisory[]> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión para ver tus asesorías');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock implementation
    return MOCK_ADVISORIES.filter(a => a.userId === user.id || a.programmerId === user.id);
}

/**
 * Update advisory status
 * TODO: Replace with actual API call to Spring Boot
 */
export async function updateAdvisoryStatus(id: string, status: 'accepted' | 'rejected'): Promise<Advisory> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock implementation
    const advisory = MOCK_ADVISORIES.find(a => a.id === id);
    if (!advisory) {
        throw new Error('Asesoría no encontrada');
    }

    if (advisory.programmerId !== user.id && user.role !== 'admin') {
        throw new Error('No tienes permiso para actualizar esta asesoría');
    }

    advisory.status = status;
    advisory.updatedAt = new Date();
    return advisory;
}
