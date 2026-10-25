import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    id,
    type = 'text',
    placeholder,
    error,
    helperText,
    className = '',
    containerClassName = '',
    rightElement,
    ...props
}, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`
            appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
            transition-colors duration-200
            ${error
                            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 text-gray-900'
                        }
            ${rightElement ? 'pr-10' : ''}
            ${className}
          `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
                    {error}
                </p>
            )}
            {!error && helperText && (
                <p className="mt-1 text-sm text-gray-500" id={`${id}-helper`}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
