// Programmer-related types
export interface ProgrammerSocial {
    github?: string;
    linkedin?: string;
    instagram?: string;
    whatsapp?: string;
}

export interface Programmer {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
    skills: string[];
    social?: ProgrammerSocial;
}

export interface ProgrammerProfile extends Programmer {
    projectCount: number;
    rating: number;
    yearsExperience: number;
}
