import React from 'react';
import { X } from 'lucide-react';

export function GlobalMessage({ message, type, onClose }: { 
  message: string; 
  type: 'error' | 'success' | 'warning'; 
  onClose: () => void;
}) {
  const baseClasses = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center max-w-sm transition duration-300 transform translate-y-0";
  const typeClasses = {
    error: 'bg-red-100 border border-red-400 text-red-700',
    success: 'bg-green-100 border border-green-400 text-green-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  }[type];

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="block sm:inline mr-4 font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto text-xl font-bold p-1 rounded-full hover:bg-opacity-75">
        <X size={18} />
      </button>
    </div>
  );
}