// User-related types
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'programmer' | 'admin';
    token: string;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}
