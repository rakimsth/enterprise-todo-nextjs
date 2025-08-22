import { useState } from "react";
import { useCreateTodo } from "../../hooks/use-todos";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { APP_CONFIG, ARIA_LABELS } from "../../utils/constants";

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const createTodo = useCreateTodo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.length > APP_CONFIG.maxTitleLength) {
      setError(`Title must be less than ${APP_CONFIG.maxTitleLength} characters`);
      return;
    }

    try {
      await createTodo.mutateAsync({
        title: title.trim(),
        completed: false,
      });

      setTitle("");
      setError("");
      onClose();
    } catch (err) {
      setError("Failed to create todo. Please try again.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Todo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="todo-title" className="block text-sm font-medium text-gray-700 mb-2">
            Title{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <Input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title..."
            disabled={createTodo.isPending}
            error={error}
            maxLength={APP_CONFIG.maxTitleLength}
            aria-describedby={error ? "title-error" : undefined}
            autoFocus
          />
          <div className="mt-1 text-xs text-gray-500">
            {title.length}/{APP_CONFIG.maxTitleLength} characters
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createTodo.isPending}
            aria-label={ARIA_LABELS.closeModal}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createTodo.isPending}
            disabled={!title.trim() || createTodo.isPending}
            aria-label={ARIA_LABELS.addTodo}
          >
            {createTodo.isPending ? "Adding..." : "Add Todo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
