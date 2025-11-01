
import React from 'react';

interface ActionButtonProps {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick, icon, className }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-lg font-bold rounded-xl shadow-lg transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50 ${className}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default ActionButton;
