// Project-related types
export type ProjectType = 'Profesional' | 'Académico';

export interface Project {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    techs: string[];
    imageUrl: string;
    repoUrl: string;
    deployUrl: string;
    ownerId: string;
}

export interface ProjectFormData {
    name: string;
    description: string;
    type: ProjectType;
    techs: string[];
    imageUrl: string;
    repoUrl: string;
    deployUrl: string;
}
