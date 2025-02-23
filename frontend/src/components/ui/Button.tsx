// src/components/ui/Button.tsx
import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
