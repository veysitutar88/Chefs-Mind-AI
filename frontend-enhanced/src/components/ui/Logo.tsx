import React, { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
    /** Size of the logo: small for sidebar, medium for larger contexts */
    size?: 'small' | 'medium';
    /** Additional Tailwind classes */
    className?: string;
    /** Whether to show only the icon without text (if applicable) */
    iconOnly?: boolean;
}

/**
 * Logo component that loads `/logo.png`. If the image cannot be loaded, it falls back to a
 * dark circular placeholder with the "CM" initials. Clicking the logo scrolls the page to the
 * top (center chat view) without resetting any state.
 */
export const Logo: React.FC<LogoProps> = ({ size = 'small', className = '', iconOnly = false }) => {
    const [hasError, setHasError] = useState(false);

    const dimensions = size === 'medium' ? { width: 120, height: 120 } : { width: 48, height: 48 };

    const handleClick = () => {
        // Smooth scroll to the top where the main chat area resides
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center justify-center ${className} hover:scale-105 active:scale-95 transition-all duration-200`}
            aria-label="Home"
        >
            {hasError ? (
                <div
                    className="flex items-center justify-center bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    style={{ width: dimensions.width, height: dimensions.height }}
                >
                    <span className="font-bold text-lg tracking-wider">CM</span>
                </div>
            ) : (
                <Image
                    src="/logo.png"
                    alt="Chef's Mind AI Logo"
                    width={dimensions.width}
                    height={dimensions.height}
                    onError={() => setHasError(true)}
                    priority
                    className="object-contain hover:opacity-90 transition-opacity"
                />
            )}
        </button>
    );
};
