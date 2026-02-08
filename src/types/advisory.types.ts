// Advisory-related types
export type AdvisoryStatus = 'pending' | 'accepted' | 'rejected';

export interface Advisory {
    id: string;
    programmerId: string;
    userId: string;
    userName: string;
    programmerName: string;
    status: AdvisoryStatus;
    message?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface CreateAdvisoryData {
    programmerId: string;
    message?: string;
}
