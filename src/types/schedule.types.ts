export interface Schedule {
    id: number;
    programmerId: number;
    programmerName: string;
    date: string;
    time: string;
    status: string;
    modality: 'VIRTUAL' | 'PRESENCIAL';
}

export interface CreateScheduleRequest {
    programmerId: number;
    date: string;
    time: string;
    modality: 'VIRTUAL' | 'PRESENCIAL';
}
