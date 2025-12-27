import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
    /** Size of the logo: small for sidebar, medium for larger contexts */
    size?: 'small' | 'medium';
    /** Additional Tailwind classes */
    className?: string;
    /** Whether to show only the icon without text (if applicable) */
    iconOnly?: boolean;
}

/**
 * Logo component that loads `/brand/logo-circle.png`. If the image cannot be loaded, it falls back to a
 * dark circular placeholder with the "CM" initials. Clicking the logo scrolls the page to the
 * top and navigates to the home view.
 */
export const Logo: React.FC<LogoProps> = ({ size = 'small', className = '', iconOnly = false }) => {
    const router = useRouter();
    const [hasError, setHasError] = useState(false);

    const dimensions = size === 'medium' ? { width: 120, height: 120 } : { width: 48, height: 48 };

    const handleClick = () => {
        // Smooth scroll to the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Navigate to home
        router.push('/');
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center justify-center rounded-full overflow-hidden relative ${className} hover:scale-105 active:scale-95 transition-all duration-200`}
            style={{ width: dimensions.width, height: dimensions.height }}
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
                    src="/brand/logo-v2-official.png"
                    alt="Chef's Mind AI Logo"
                    fill
                    onError={() => setHasError(true)}
                    priority
                    className="object-cover hover:opacity-90 transition-opacity"
                />
            )}
        </button>
    );
};
