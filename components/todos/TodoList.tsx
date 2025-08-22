"use client";

import { useState, useMemo } from "react";
import { useTodos } from "../../hooks/use-todos";
import { TodoItem } from "./TodoItem";
import { TodoForm } from "./TodoForm";
import { Button } from "../ui/Button";
import { TodoFilter } from "../../types/todo";
import { cn } from "../../utils/cn";
import { ARIA_LABELS } from "../../utils/constants";

export const TodoList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const { data: todos = [], isLoading, error, refetch } = useTodos();

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "pending") return !todo.completed;
      return true;
    });
  }, [todos, filter]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
    }),
    [todos]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-gray-600">Loading todos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 p-8">
        <div className="text-red-600">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium">Error Loading Todos</h3>
          <p className="text-sm mt-2">{(error as Error).message}</p>
        </div>
        <Button onClick={() => refetch()} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          <p className="text-gray-600 mt-1">
            {counts.all === 0 ? "No todos yet" : `${counts.completed} of ${counts.all} completed`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          aria-label={ARIA_LABELS.addTodo}
          className="self-start sm:self-auto"
        >
          Add Todo
        </Button>
      </div>

      {/* Filters */}
      {counts.all > 0 && (
        <div
          className="flex flex-wrap gap-2 mb-6"
          role="tablist"
          aria-label={ARIA_LABELS.filterTodos}
        >
          {(["all", "pending", "completed"] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                filter === filterType
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              role="tab"
              aria-selected={filter === filterType}
              aria-controls="todo-list"
            >
              {filterType} ({counts[filterType]})
            </button>
          ))}
        </div>
      )}

      {/* Todo List */}
      <div id="todo-list" role="tabpanel" className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all" ? "No todos yet" : `No ${filter} todos`}
            </h3>
            {filter === "all" && (
              <p className="text-gray-600 mb-4">Get started by creating your first todo!</p>
            )}
            {filter === "all" && (
              <Button onClick={() => setShowForm(true)}>Create Your First Todo</Button>
            )}
          </div>
        ) : (
          <div role="list" aria-label={`${filter} todos`}>
            {filteredTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};
