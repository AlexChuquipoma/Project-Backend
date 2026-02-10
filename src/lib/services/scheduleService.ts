import type { CreateScheduleRequest, Schedule } from "../../types/schedule.types";

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

function getAuthHeader(): HeadersInit {
    const userStr = localStorage.getItem("ciber_user");
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
    };
}

export async function getAllSchedules(): Promise<Schedule[]> {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Error fetching schedules");
    return response.json();
}

export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error creating schedule");
    return response.json();
}

export async function getSchedulesByProgrammer(programmerId: number): Promise<Schedule[]> {
    const response = await fetch(`${API_BASE_URL}/api/schedules/programmer/${programmerId}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) return [];
    return response.json();
}

export async function deleteSchedule(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Error deleting schedule");
}
