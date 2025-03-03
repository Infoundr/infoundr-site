import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  variant, 
  children, 
  onClick, 
  className = '' 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-gray-800 hover:bg-gray-200"
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