import React, { useState } from 'react';
import { User } from 'lucide-react';

const Avatar = ({ src, alt, className = "w-12 h-12", iconSize = "w-6 h-6", fallbackBg = "bg-blue-100", fallbackText = "text-blue-600" }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`${className} rounded-full flex items-center justify-center ${fallbackBg} ${fallbackText} flex-shrink-0 transition-opacity duration-300`}>
                <User className={iconSize} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} rounded-full object-cover flex-shrink-0 transition-opacity duration-300`}
            onError={() => setError(true)}
            loading="lazy"
        />
    );
};

export default Avatar;
