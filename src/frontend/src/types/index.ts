export interface Assistant {
  name: string;
  description: string;
  icon: string;
}

export type ButtonProps = {
  variant: 'primary' | 'secondary' | 'dark';
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}; 

export interface CardProps {
  children: React.ReactNode;
  className?: string;
} 