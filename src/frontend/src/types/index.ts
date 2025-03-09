export interface Assistant {
  name: string;
  description: string;
  icon: string;
}

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'dark';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
} 