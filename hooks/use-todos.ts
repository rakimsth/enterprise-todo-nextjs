import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { todoApi } from "../lib/todo-api";
import { Todo, CreateTodoRequest, UpdateTodoRequest } from "../types/todo";
import { toast } from "react-hot-toast";

export const QUERY_KEYS = {
  todos: ["todos"] as const,
  todo: (id: number) => ["todo", id] as const,
} as const;

export const useTodos = (options?: UseQueryOptions<Todo[]>) => {
  return useQuery({
    queryKey: QUERY_KEYS.todos,
    queryFn: () => todoApi.getTodos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error: any) => {
      if (error?.status === 404 || error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

export const useTodo = (id: number, options?: UseQueryOptions<Todo>) => {
  return useQuery({
    queryKey: QUERY_KEYS.todo(id),
    queryFn: () => todoApi.getTodo(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEYS.todos);

      // Optimistically update
      const optimisticTodo: Todo = {
        id: Date.now(),
        ...newTodo,
      };

      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todos, (old = []) => [optimisticTodo, ...old]);

      return { previousTodos, optimisticTodo };
    },
    onSuccess: (newTodo, _, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todos, (old = []) =>
        old.map((todo) => (todo.id === context?.optimisticTodo.id ? newTodo : todo))
      );
      toast.success("Todo created successfully!");
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(QUERY_KEYS.todos, context.previousTodos);
      }
      toast.error(`Failed to create todo: ${error.message}`);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.updateTodo,
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todo(updatedTodo.id) });

      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEYS.todos);
      const previousTodo = queryClient.getQueryData<Todo>(QUERY_KEYS.todo(updatedTodo.id));

      // Optimistically update todos list
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todos, (old = []) =>
        old.map((todo) => (todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo))
      );

      // Optimistically update individual todo
      if (previousTodo) {
        queryClient.setQueryData(QUERY_KEYS.todo(updatedTodo.id), {
          ...previousTodo,
          ...updatedTodo,
        });
      }

      return { previousTodos, previousTodo };
    },
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todos, (old = []) =>
        old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      queryClient.setQueryData(QUERY_KEYS.todo(updatedTodo.id), updatedTodo);
      toast.success("Todo updated successfully!");
    },
    onError: (error, updatedTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(QUERY_KEYS.todos, context.previousTodos);
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(QUERY_KEYS.todo(updatedTodo.id), context.previousTodo);
      }
      toast.error(`Failed to update todo: ${error.message}`);
    },
    onSettled: (_, __, updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todo(updatedTodo.id) });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.todos });

      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEYS.todos);

      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todos, (old = []) =>
        old.filter((todo) => todo.id !== deletedId)
      );

      return { previousTodos, deletedId };
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.todo(deletedId) });
      toast.success("Todo deleted successfully!");
    },
    onError: (error, deletedId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(QUERY_KEYS.todos, context.previousTodos);
      }
      toast.error(`Failed to delete todo: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos });
    },
  });
};
