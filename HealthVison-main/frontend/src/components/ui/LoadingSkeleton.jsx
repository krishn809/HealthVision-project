import React from 'react';

const LoadingSkeleton = ({ className = '', variant = 'rectangular', width, height }) => {
    const baseClasses = 'bg-gray-200 animate-pulse rounded';

    const variantClasses = {
        rectangular: '',
        circular: 'rounded-full',
        text: 'h-4 w-full mb-2',
    };

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

export default LoadingSkeleton;
