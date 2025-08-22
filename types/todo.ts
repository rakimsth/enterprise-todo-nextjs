import { z } from 'zod';

export const TodoSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  completed: z.boolean(),
  userId: z.number().positive().optional(),
});

export const CreateTodoSchema = TodoSchema.omit({ id: true });
export const UpdateTodoSchema = TodoSchema.partial().extend({
  id: z.number().positive(),
});

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoRequest = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof UpdateTodoSchema>;

export interface TodosResponse {
  todos: Todo[];
  total: number;
  hasMore: boolean;
}

export type TodoFilter = 'all' | 'completed' | 'pending';