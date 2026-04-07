import { useState, useCallback } from 'react';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    dismiss,
    success: useCallback((msg) => addToast(msg, 'success'), [addToast]),
    error:   useCallback((msg) => addToast(msg, 'error'),   [addToast]),
    info:    useCallback((msg) => addToast(msg, 'info'),    [addToast]),
  };
}
