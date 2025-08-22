export const APP_CONFIG = {
  maxTitleLength: 200,
  debounceDelay: 300,
  queryStaleTime: 5 * 60 * 1000, // 5 minutes
  toastDuration: 3000,
} as const;

export const ARIA_LABELS = {
  addTodo: 'Add new todo',
  toggleComplete: 'Toggle todo completion',
  editTodo: 'Edit todo',
  deleteTodo: 'Delete todo',
  cancelEdit: 'Cancel editing',
  saveEdit: 'Save changes',
  filterTodos: 'Filter todos',
  closeModal: 'Close modal',
} as const;