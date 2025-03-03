import React from 'react';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  variant, 
  children, 
  onClick, 
  className = '' 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-200";
  const variantStyles = {
    primary: "bg-[#6B46C1] hover:bg-[#553C9A] text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button; 