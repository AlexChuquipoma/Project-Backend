export interface Schedule {
    id: string;
    programmerId: string;
    programmerName: string;
    date: string;
    time: string;
    status: string;
}

export interface CreateScheduleRequest {
    programmerId: string;
    date: string;
    time: string;
}
