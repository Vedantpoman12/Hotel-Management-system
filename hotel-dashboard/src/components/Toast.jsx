import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: '#10b981',
  error:   '#f43f5e',
  info:    '#3b82f6',
  warning: '#f59e0b',
};

function Toast({ id, message, type, onRemove }) {
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`toast toast-${type}`}>
      <Icon size={16} color={COLORS[type]} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
