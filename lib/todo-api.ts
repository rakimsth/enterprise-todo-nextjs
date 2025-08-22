import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoSchema,
  CreateTodoSchema,
} from "../types/todo";
import { apiClient } from "./api-client";

export const todoApi = {
  getTodos: async (limit = 20): Promise<Todo[]> => {
    const data = await apiClient.get<Todo[]>("/todos");
    // Validate response data
    const validatedTodos = data.slice(0, limit).map((todo) => TodoSchema.parse(todo));
    return validatedTodos;
  },

  getTodo: async (id: number): Promise<Todo> => {
    const data = await apiClient.get<Todo>(`/todos/${id}`);
    return TodoSchema.parse(data);
  },

  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    // Validate input
    const validatedInput = CreateTodoSchema.parse(todo);

    const data = await apiClient.post<Todo>("/todos", {
      ...validatedInput,
      userId: 1,
    });

    // Return with generated ID for demo purposes
    const newTodo = {
      ...data,
      id: Date.now(),
      ...validatedInput,
    };

    return TodoSchema.parse(newTodo);
  },

  updateTodo: async ({ id, ...updateData }: UpdateTodoRequest): Promise<Todo> => {
    const data = await apiClient.put<Todo>(`/todos/${id}`, {
      ...updateData,
      userId: 1,
    });

    return TodoSchema.parse({ ...data, id, ...updateData });
  },

  deleteTodo: async (id: number): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};
