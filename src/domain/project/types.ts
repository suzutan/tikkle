export interface Project {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
}

export interface UpdateProjectInput {
  name?: string;
  sortOrder?: number;
}
