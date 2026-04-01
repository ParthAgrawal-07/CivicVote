// frontend/src/components/Toast.jsx
import { useState, useEffect } from 'react';

// Simple event bus — call toast('msg') or toast('msg','red') from anywhere
const listeners = new Set();
export function toast(message, type = 'green') {
  listeners.forEach(fn => fn(message, type));
}

export default function Toast() {
  const [visible, setVisible]   = useState(false);
  const [message, setMessage]   = useState('');
  const [type, setType]         = useState('green');
  const [timeoutId, setTid]     = useState(null);

  useEffect(() => {
    const handler = (msg, t) => {
      setMessage(msg);
      setType(t);
      setVisible(true);
      if (timeoutId) clearTimeout(timeoutId);
      setTid(setTimeout(() => setVisible(false), 3500));
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [timeoutId]);

  if (!visible) return null;

  const bg = type === 'red' ? 'bg-ink border-l-4 border-cvred' : 'bg-ink border-l-4 border-cvgreen';

  return (
    <div className={`toast ${bg}`}>
      {message}
    </div>
  );
}
