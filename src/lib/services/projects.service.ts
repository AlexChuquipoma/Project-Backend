import type { Project, ProjectFormData } from '../../types/project.types';
import { getProjects, setProjects, addProject as addProjectToStorage, updateProject as updateProjectInStorage, deleteProject as deleteProjectFromStorage } from '../utils/localStorage';
import { generateId } from '../utils/formatters';
import { getCurrentUser } from './auth.service';

/**
 * Get all projects
 * TODO: Replace with actual API call to Spring Boot
 */
export async function getAllProjects(): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock implementation - replace with: apiCall(API_ENDPOINTS.projects.getAll)
    return getProjects();
}

/**
 * Get project by ID
 * TODO: Replace with actual API call to Spring Boot
 */
export async function getProjectById(id: string): Promise<Project | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock implementation
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
}

/**
 * Get projects by user ID
 * TODO: Replace with actual API call to Spring Boot
 */
export async function getProjectsByUser(userId: string): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock implementation
    const projects = getProjects();
    return projects.filter(p => p.ownerId === userId);
}

/**
 * Create new project
 * TODO: Replace with actual API call to Spring Boot
 */
export async function createProject(data: ProjectFormData): Promise<Project> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión para crear proyectos');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock implementation
    const newProject: Project = {
        id: generateId(),
        ...data,
        ownerId: user.id,
    };

    addProjectToStorage(newProject);
    return newProject;
}

/**
 * Update existing project
 * TODO: Replace with actual API call to Spring Boot
 */
export async function updateProject(id: string, updates: Partial<ProjectFormData>): Promise<Project> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión para actualizar proyectos');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock implementation
    const project = await getProjectById(id);
    if (!project) {
        throw new Error('Proyecto no encontrado');
    }

    if (project.ownerId !== user.id && user.role !== 'admin') {
        throw new Error('No tienes permiso para actualizar este proyecto');
    }

    updateProjectInStorage(id, updates);
    return { ...project, ...updates };
}

/**
 * Delete project
 * TODO: Replace with actual API call to Spring Boot
 */
export async function deleteProject(id: string): Promise<void> {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('Debes iniciar sesión para eliminar proyectos');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock implementation
    const project = await getProjectById(id);
    if (!project) {
        throw new Error('Proyecto no encontrado');
    }

    if (project.ownerId !== user.id && user.role !== 'admin') {
        throw new Error('No tienes permiso para eliminar este proyecto');
    }

    deleteProjectFromStorage(id);
}
