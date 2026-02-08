import type { User } from "../../types/user.types";

const API_BASE_URL =
    import.meta.env.PUBLIC_API_URL ||
    (import.meta.env.DEV
        ? "http://localhost:8080"
        : "https://backend-spring-wgjc.onrender.com");

function getAuthHeader(): HeadersInit {
    const userStr = localStorage.getItem("ciber_user");
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
    };
}

export async function getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error("Error al obtener usuarios");
    }
    return response.json();
}

export async function updateUserRole(id: string, role: string): Promise<User> {
    const response = await fetch(
        `${API_BASE_URL}/api/users/${id}/role?role=${role.toUpperCase()}`,
        {
            method: "PUT",
            headers: getAuthHeader(),
        }
    );

    if (!response.ok) {
        throw new Error("Error al actualizar rol");
    }
    return response.json();
}

export async function deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error("Error al eliminar usuario");
    }
}
