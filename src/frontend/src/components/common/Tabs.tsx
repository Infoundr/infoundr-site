import * as React from "react";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`flex space-x-2 border-b mb-4 ${className}`}>{children}</div>
);

export const TabsTrigger: React.FC<{
  value: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ value, active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 text-sm font-medium ${
      active ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-800"
    }`}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{ value: string; children: React.ReactNode }> = ({
  children,
}) => <div className="mt-2">{children}</div>;
