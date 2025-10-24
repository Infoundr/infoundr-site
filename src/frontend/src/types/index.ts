export interface Assistant {
  name: string;
  description: string;
  icon: string;
}

export type ButtonProps = {
  variant: 'primary' | 'secondary' | 'dark';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}; 

export interface CardProps {
  children: React.ReactNode;
  className?: string;
} 