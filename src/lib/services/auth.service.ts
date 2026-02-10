import type { User, LoginCredentials, RegisterData } from '../../types/user.types';
import { getUser, setUser, removeUser } from '../utils/localStorage';

// Backend API URL (Producción en Render)
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

// API Response type from Spring Boot
interface AuthResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    token: string;
}

/**
 * Login user
 * Connects to Spring Boot backend: POST /api/auth/login
 */
export async function login(credentials: LoginCredentials): Promise<User> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Credenciales inválidas');
            }
            throw new Error('Error al iniciar sesión');
        }

        const data: AuthResponse = await response.json();

        // Convert backend response to frontend User type
        const user: User = {
            id: data.id.toString(),
            name: data.name,
            email: data.email,
            role: data.role.toLowerCase() as 'user' | 'programmer' | 'admin',
            token: data.token,
        };

        setUser(user);
        return user;
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error de conexión con el servidor');
    }
}

/**
 * Register new user
 * Connects to Spring Boot backend: POST /api/auth/register
 */
export async function register(data: RegisterData): Promise<User> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400) {
                throw new Error(errorData.message || 'Datos inválidos');
            }
            if (response.status === 409) {
                throw new Error('El correo ya está registrado');
            }
            throw new Error('Error al registrar usuario');
        }

        const responseData: AuthResponse = await response.json();

        // Convert backend response to frontend User type
        const user: User = {
            id: responseData.id.toString(),
            name: responseData.name,
            email: responseData.email,
            role: responseData.role.toLowerCase() as 'user' | 'programmer' | 'admin',
            token: responseData.token,
        };

        setUser(user);
        return user;
    } catch (error) {
        console.error('Register error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error de conexión con el servidor');
    }
}

/**
 * Logout current user
 * Clears local storage (no backend call needed since JWT is stateless)
 */
export async function logout(): Promise<void> {
    removeUser();
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): User | null {
    return getUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: 'user' | 'programmer' | 'admin'): boolean {
    const user = getCurrentUser();
    return user?.role === role;
}

