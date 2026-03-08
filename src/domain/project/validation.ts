import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').optional(),
  sortOrder: z.number().int().min(0).optional(),
});
