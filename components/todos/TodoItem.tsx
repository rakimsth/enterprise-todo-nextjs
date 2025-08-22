import { useState, useRef, useEffect } from "react";
import { Todo } from "../../types/todo";
import { useUpdateTodo, useDeleteTodo } from "../../hooks/use-todos";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn } from "../../utils/cn";
import { APP_CONFIG, ARIA_LABELS } from "../../utils/constants";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggleComplete = async () => {
    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        completed: !todo.completed,
      });
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setError("");
  };

  const handleSaveEdit = async () => {
    setError("");

    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }

    if (editTitle.length > APP_CONFIG.maxTitleLength) {
      setError(`Title must be less than ${APP_CONFIG.maxTitleLength} characters`);
      return;
    }

    if (editTitle.trim() === todo.title) {
      setIsEditing(false);
      return;
    }

    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        title: editTitle.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update todo");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      try {
        await deleteTodo.mutateAsync(todo.id);
      } catch (err) {
        // Error handling is done in the hook
      }
    }
  };

  const isLoading = updateTodo.isPending || deleteTodo.isPending;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm transition-opacity",
        isLoading && "opacity-50"
      )}
      role="listitem"
    >
      <div className="flex items-center pt-1">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          disabled={isLoading}
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          aria-label={ARIA_LABELS.toggleComplete}
          aria-describedby={`todo-${todo.id}-title`}
        />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-sm"
              error={error}
              maxLength={APP_CONFIG.maxTitleLength}
              aria-label="Edit todo title"
            />
            <div className="text-xs text-gray-500">
              {editTitle.length}/{APP_CONFIG.maxTitleLength} characters
            </div>
          </div>
        ) : (
          <span
            id={`todo-${todo.id}-title`}
            className={cn(
              "block text-sm break-words",
              todo.completed ? "line-through text-gray-500" : "text-gray-900"
            )}
          >
            {todo.title}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isLoading}
              aria-label={ARIA_LABELS.cancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isLoading || !editTitle.trim()}
              loading={updateTodo.isPending}
              aria-label={ARIA_LABELS.saveEdit}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEdit}
              disabled={isLoading}
              aria-label={ARIA_LABELS.editTodo}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
              loading={deleteTodo.isPending}
              aria-label={ARIA_LABELS.deleteTodo}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
