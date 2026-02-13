import React from 'react';

export type HabitatType =
    | 'mika_room'
    | 'bolt_yard'
    | 'mati_jungle'
    | 'sky_aquarium'
    | 'shira_sky'
    | 'lalo_forest'
    | 'pop_bamboo'
    | 'bit_lab'
    | 'default'; // Fallback

interface PetHabitatProps {
    type: HabitatType | string;
    className?: string;
}

export const PetHabitat: React.FC<PetHabitatProps> = ({ type, className = '' }) => {
    const renderHabitat = () => {
        switch (type) {
            case 'mika_room':
                return (
                    <g>
                        {/* Wall */}
                        <rect x="0" y="0" width="400" height="300" fill="#FDF5E6" />
                        {/* Floor */}
                        <rect x="0" y="300" width="400" height="100" fill="#D2B48C" />
                        {/* Window */}
                        <rect x="50" y="50" width="100" height="100" fill="#87CEEB" stroke="#8B4513" strokeWidth="5" />
                        <line x1="100" y1="50" x2="100" y2="150" stroke="#8B4513" strokeWidth="3" />
                        <line x1="50" y1="100" x2="150" y2="100" stroke="#8B4513" strokeWidth="3" />
                        {/* Rug */}
                        <ellipse cx="200" cy="350" rx="120" ry="40" fill="#CD853F" opacity="0.6" />
                        {/* Cushion */}
                        <rect x="250" y="280" width="80" height="40" rx="10" fill="#FF6347" />
                    </g>
                );
            case 'bolt_yard':
                return (
                    <g>
                        {/* Sky */}
                        <rect x="0" y="0" width="400" height="250" fill="#87CEEB" />
                        {/* Grass */}
                        <rect x="0" y="250" width="400" height="150" fill="#7CFC00" />
                        {/* Sun */}
                        <circle cx="350" cy="50" r="30" fill="#FFD700" />
                        {/* Fence */}
                        <line x1="0" y1="250" x2="400" y2="250" stroke="#8B4513" strokeWidth="5" />
                        {[...Array(10)].map((_, i) => (
                            <line key={i} x1={20 + i * 40} y1="200" x2={20 + i * 40} y2="250" stroke="#8B4513" strokeWidth="5" />
                        ))}
                    </g>
                );
            case 'mati_jungle':
                return (
                    <g>
                        {/* Sky */}
                        <rect x="0" y="0" width="400" height="400" fill="#ADD8E6" />
                        {/* Volcano */}
                        <path d="M50 250 L150 100 L250 250 Z" fill="#696969" />
                        <path d="M150 100 L140 130 L160 130 Z" fill="#FF4500" /> {/* Lava tip */}
                        {/* Ground */}
                        <path d="M0 250 Q200 200 400 250 L400 400 L0 400 Z" fill="#228B22" />
                        {/* Ferns */}
                        <path d="M300 300 Q320 250 340 300" stroke="#006400" strokeWidth="8" fill="none" />
                        <path d="M320 320 Q340 270 360 320" stroke="#006400" strokeWidth="8" fill="none" />
                    </g>
                );
            case 'sky_aquarium':
                return (
                    <g>
                        {/* Water Background */}
                        <rect x="0" y="0" width="400" height="400" fill="#E0FFFF" />
                        <rect x="0" y="100" width="400" height="300" fill="#AFEEEE" opacity="0.5" />
                        {/* Sand */}
                        <rect x="0" y="350" width="400" height="50" fill="#F4A460" />
                        {/* Coral */}
                        <path d="M50 350 Q60 300 50 250" stroke="#FF7F50" strokeWidth="10" strokeLinecap="round" fill="none" />
                        <path d="M70 350 Q80 280 90 350" stroke="#FF7F50" strokeWidth="8" strokeLinecap="round" fill="none" />
                        {/* Bubbles */}
                        <circle cx="100" cy="200" r="5" fill="white" opacity="0.6" />
                        <circle cx="120" cy="150" r="8" fill="white" opacity="0.6" />
                        <circle cx="300" cy="100" r="6" fill="white" opacity="0.6" />
                    </g>
                );
            case 'shira_sky':
                return (
                    <g>
                        {/* Sky Gradient Mockup */}
                        <rect x="0" y="0" width="400" height="400" fill="#B0E0E6" />
                        {/* Clouds */}
                        <circle cx="100" cy="100" r="40" fill="white" opacity="0.9" />
                        <circle cx="150" cy="100" r="50" fill="white" opacity="0.9" />
                        <circle cx="80" cy="120" r="40" fill="white" opacity="0.9" />

                        <circle cx="300" cy="200" r="30" fill="white" opacity="0.8" />
                        <circle cx="340" cy="200" r="40" fill="white" opacity="0.8" />

                        {/* Sun rays */}
                        <line x1="0" y1="0" x2="100" y2="100" stroke="yellow" strokeWidth="2" opacity="0.5" />
                        <line x1="50" y1="0" x2="120" y2="80" stroke="yellow" strokeWidth="2" opacity="0.5" />
                    </g>
                );
            case 'lalo_forest':
                return (
                    <g>
                        {/* Fall Sky */}
                        <rect x="0" y="0" width="400" height="400" fill="#FFDAB9" />
                        {/* Hills */}
                        <path d="M0 300 Q200 250 400 300 L400 400 L0 400 Z" fill="#8B4513" />
                        {/* Trees */}
                        <rect x="50" y="200" width="20" height="100" fill="#A0522D" />
                        <circle cx="60" cy="180" r="40" fill="#FF8C00" /> {/* Orange leaves */}

                        <rect x="350" y="220" width="20" height="80" fill="#A0522D" />
                        <circle cx="360" cy="200" r="35" fill="#CD5C5C" /> {/* Reddish leaves */}

                        {/* Fallen Leaves */}
                        <ellipse cx="200" cy="350" rx="10" ry="5" fill="#FF4500" />
                        <ellipse cx="250" cy="360" rx="10" ry="5" fill="#FFD700" />
                    </g>
                );
            case 'pop_bamboo':
                return (
                    <g>
                        {/* Mist Background */}
                        <rect x="0" y="0" width="400" height="400" fill="#F0FFF0" />
                        {/* Ground */}
                        <rect x="0" y="350" width="400" height="50" fill="#556B2F" />
                        {/* Bamboo Stalks */}
                        <rect x="40" y="50" width="20" height="300" fill="#228B22" />
                        <line x1="40" y1="100" x2="60" y2="100" stroke="#006400" strokeWidth="2" />
                        <line x1="40" y1="180" x2="60" y2="180" stroke="#006400" strokeWidth="2" />
                        <line x1="40" y1="260" x2="60" y2="260" stroke="#006400" strokeWidth="2" />

                        <rect x="340" y="20" width="25" height="330" fill="#228B22" />
                        <line x1="340" y1="80" x2="365" y2="80" stroke="#006400" strokeWidth="2" />
                        <line x1="340" y1="160" x2="365" y2="160" stroke="#006400" strokeWidth="2" />

                        {/* Leaves */}
                        <ellipse cx="60" cy="100" rx="15" ry="5" fill="#32CD32" transform="rotate(-30 60 100)" />
                        <ellipse cx="340" cy="160" rx="15" ry="5" fill="#32CD32" transform="rotate(30 340 160)" />
                    </g>
                );
            case 'bit_lab':
                return (
                    <g>
                        {/* Dark Background */}
                        <rect x="0" y="0" width="400" height="400" fill="#2F4F4F" />
                        {/* Grid Floor */}
                        <path d="M0 300 H400 M50 300 L0 400 M150 300 L100 400 M250 300 L300 400 M350 300 L400 400" stroke="#00FFFF" strokeWidth="1" opacity="0.5" />
                        {/* Circuit Lines on Wall */}
                        <path d="M50 50 L50 150 L100 150" stroke="#00FF00" strokeWidth="2" fill="none" />
                        <circle cx="100" cy="150" r="5" fill="#00FF00" />

                        <path d="M350 250 L350 150 L300 150" stroke="#00FF00" strokeWidth="2" fill="none" />
                        <circle cx="300" cy="150" r="5" fill="#00FF00" />

                        {/* Screen */}
                        <rect x="150" y="50" width="100" height="60" fill="black" stroke="#00FFFF" strokeWidth="2" />
                        <text x="200" y="90" textAnchor="middle" fill="#00FFFF" fontSize="20" fontFamily="monospace">10101</text>
                    </g>
                );
            default:
                // Simple generic room
                return (
                    <g>
                        <rect x="0" y="0" width="400" height="300" fill="#E6E6FA" />
                        <rect x="0" y="300" width="400" height="100" fill="#D3D3D3" />
                        <rect x="100" y="100" width="200" height="150" fill="white" stroke="#A9A9A9" strokeWidth="2" />
                    </g>
                );
        }
    };

    return (
        <svg
            viewBox="0 0 400 400"
            className={`w-full h-full absolute inset-0 -z-10 ${className}`}
            preserveAspectRatio="xMidYMid slice"
        >
            {renderHabitat()}
        </svg>
    );
};
