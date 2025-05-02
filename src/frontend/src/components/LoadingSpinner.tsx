import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 border-4 border-[#4C1D95] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner; 