import type { User } from '../types/user.types';
import type { Project } from '../types/project.types';

// User management
export function getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('ciber_user');
    return stored ? JSON.parse(stored) : null;
}

export function setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ciber_user', JSON.stringify(user));
}

export function removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('ciber_user');
}

// Projects management
export function getProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('ciber_projects');
    return stored ? JSON.parse(stored) : [];
}

export function setProjects(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ciber_projects', JSON.stringify(projects));
}

export function addProject(project: Project): void {
    const projects = getProjects();
    projects.push(project);
    setProjects(projects);
}

export function updateProject(id: string, updates: Partial<Project>): void {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
        projects[index] = { ...projects[index], ...updates };
        setProjects(projects);
    }
}

export function deleteProject(id: string): void {
    const projects = getProjects().filter(p => p.id !== id);
    setProjects(projects);
}
