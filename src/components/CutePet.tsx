// @ts-nocheck
import { useState, useEffect } from 'react';
import { PetType } from '../data/petData';
import { PetHabitat, HabitatType } from './PetHabitat';

interface CutePetProps {
    type: PetType;
    isPenalized: boolean;
    isFocusing: boolean;
    habitatType?: HabitatType | string;
    lastInteractionTime?: number;
}

interface PetConfig {
    bodyPath: string;
    topFeatures?: JSX.Element;
    sideFeatures?: JSX.Element;
    faceFeatures?: JSX.Element;
    animationType: 'breathe' | 'float' | 'mechanical';
    animationDuration: string;
    colors: { body: string; belly: string; shadow: string };
}

export const CutePet = ({
    type,
    isPenalized,
    isFocusing,
    habitatType = 'default',
    lastInteractionTime = Date.now()
}: CutePetProps) => {
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, Math.random() * 3000 + 2000);
        return () => clearInterval(interval);
    }, []);

    const getPetConfig = (type: PetType) => {
        const circleBody = "M100 20 C 150 20, 180 60, 180 110 C 180 170, 150 190, 100 190 C 50 190, 20 170, 20 110 C 20 60, 50 20, 100 20 Z";

        switch (type) {
            case 'gato':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#FF00FF', belly: '#FFB6C1', shadow: '#C71585' },
                    animationType: 'breathe',
                    animationDuration: '2s',
                    topFeatures: (
                        <>
                            <path d="M 40 50 L 20 10 L 70 40 Z" fill="#FF00FF" stroke="#C71585" strokeWidth="2" />
                            <path d="M 160 50 L 180 10 L 130 40 Z" fill="#FF00FF" stroke="#C71585" strokeWidth="2" />
                        </>
                    ),
                    sideFeatures: (
                        <g stroke="#C71585" strokeWidth="1" opacity="0.6">
                            <path d="M 40 110 L 10 100" />
                            <path d="M 40 120 L 10 120" />
                            <path d="M 40 130 L 10 140" />
                            <path d="M 160 110 L 190 100" />
                            <path d="M 160 120 L 190 120" />
                            <path d="M 160 130 L 190 140" />
                        </g>
                    )
                };
            case 'perro':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#00FFFF', belly: '#E0FFFF', shadow: '#00CED1' },
                    animationType: 'organic-fast',
                    animationDuration: '1.5s',
                    topFeatures: (
                        <>
                            <ellipse cx="30" cy="70" rx="15" ry="35" fill="#00FFFF" stroke="#00CED1" transform="rotate(-15 30 70)" />
                            <ellipse cx="170" cy="70" rx="15" ry="35" fill="#00FFFF" stroke="#00CED1" transform="rotate(15 170 70)" />
                        </>
                    ),
                    faceFeatures: (
                        <>
                            <circle cx="100" cy="115" r="12" fill="#E0FFFF" opacity="0.5" />
                            <circle cx="100" cy="110" r="4" fill="#333" />
                            <path d="M 60 160 Q 100 180 140 160" stroke="#FF4500" strokeWidth="4" fill="none" />
                        </>
                    )
                };
            case 'dino':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#39FF14', belly: '#90EE90', shadow: '#32CD32' },
                    animationType: 'organic-slow',
                    animationDuration: '4s',
                    topFeatures: (
                        <>
                            <path d="M 140 40 L 160 20 L 170 50 Z" fill="#32CD32" />
                            <path d="M 165 60 L 185 40 L 185 70 Z" fill="#32CD32" />
                            <path d="M 175 80 L 195 60 L 190 90 Z" fill="#32CD32" />
                        </>
                    ),
                    sideFeatures: (
                        <path d="M 160 150 Q 200 170 190 190" stroke="#32CD32" strokeWidth="8" fill="none" strokeLinecap="round" />
                    ),
                    faceFeatures: (
                        <g fill="#32CD32" opacity="0.4">
                            <circle cx="50" cy="150" r="3" />
                            <circle cx="150" cy="150" r="4" />
                            <circle cx="120" cy="170" r="2" />
                        </g>
                    )
                };
            case 'axolote':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#1E90FF', belly: '#87CEFA', shadow: '#4169E1' },
                    animationType: 'float',
                    animationDuration: '3s',
                    sideFeatures: (
                        <>
                            <path d="M 30 80 Q 10 70 20 90 Z" fill="#FF69B4" />
                            <path d="M 25 100 Q 5 90 15 110 Z" fill="#FF69B4" />
                            <path d="M 30 120 Q 10 110 20 130 Z" fill="#FF69B4" />
                            <path d="M 170 80 Q 190 70 180 90 Z" fill="#FF69B4" />
                            <path d="M 175 100 Q 195 90 185 110 Z" fill="#FF69B4" />
                            <path d="M 170 120 Q 190 110 180 130 Z" fill="#FF69B4" />
                        </>
                    ),
                    faceFeatures: (
                        <path d="M 80 125 Q 100 145 120 125" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                    )
                };
            case 'pajaro':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#FFFFFF', belly: '#F0F0F0', shadow: '#CCCCCC' },
                    animationType: 'organic-fast',
                    animationDuration: '1.5s',
                    topFeatures: (
                        <path d="M 90 20 Q 100 5 110 20 L 100 40 Z" fill="#FFFFFF" stroke="#CCCCCC" />
                    ),
                    sideFeatures: (
                        <>
                            <path d="M 20 100 Q 5 120 20 140" stroke="#FFFFFF" strokeWidth="3" fill="#F0F0F0" />
                            <path d="M 180 100 Q 195 120 180 140" stroke="#FFFFFF" strokeWidth="3" fill="#F0F0F0" />
                        </>
                    ),
                    faceFeatures: (
                        <polygon points="95,120 105,120 100,135" fill="#FF8C00" />
                    )
                };
            case 'zorro':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#9D00FF', belly: '#D8BFD8', shadow: '#8A2BE2' },
                    animationType: 'organic-fast',
                    animationDuration: '2s',
                    topFeatures: (
                        <>
                            <path d="M 40 60 L 20 20 L 80 50 Z" fill="#9D00FF" stroke="#8A2BE2" />
                            <path d="M 35 50 L 30 35 L 60 50 Z" fill="#FFFDD0" />
                            <path d="M 160 60 L 180 20 L 120 50 Z" fill="#9D00FF" stroke="#8A2BE2" />
                            <path d="M 165 50 L 170 35 L 140 50 Z" fill="#FFFDD0" />
                        </>
                    ),
                    faceFeatures: (
                        <path d="M 100 120 L 60 150 Q 100 190 140 150 Z" fill="#FFFFFF" opacity="0.8" />
                    )
                };
            case 'panda':
                return {
                    bodyPath: circleBody,
                    colors: { body: '#FFFFFF', belly: '#FFC0CB', shadow: '#DC143C' },
                    animationType: 'organic-slow',
                    animationDuration: '4s',
                    topFeatures: (
                        <>
                            <circle cx="50" cy="50" r="20" fill="#000000" />
                            <circle cx="150" cy="50" r="20" fill="#000000" />
                        </>
                    ),
                    faceFeatures: (
                        <>
                            <ellipse cx="75" cy="100" rx="15" ry="12" fill="#000000" transform="rotate(-30 75 100)" />
                            <ellipse cx="125" cy="100" rx="15" ry="12" fill="#000000" transform="rotate(30 125 100)" />
                        </>
                    )
                };
            case 'robot':
                return {
                    bodyPath: "M 50 50 L 150 50 L 150 150 L 50 150 Z",
                    colors: { body: '#FFD700', belly: '#FFFFE0', shadow: '#DAA520' },
                    animationType: 'mechanical',
                    animationDuration: '1s',
                    topFeatures: (
                        <g>
                            <line x1="100" y1="50" x2="100" y2="20" stroke="#DAA520" strokeWidth="4" />
                            <circle cx="100" cy="20" r="6" fill="#FF0000">
                                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                            </circle>
                        </g>
                    ),
                    faceFeatures: (
                        <g>
                            <rect x="70" y="90" width="12" height="12" fill="#333" />
                            <rect x="118" y="90" width="12" height="12" fill="#333" />
                            <rect x="85" y="130" width="30" height="4" fill="#333" />
                        </g>
                    )
                };
            default:
                return {
                    bodyPath: circleBody,
                    colors: { body: '#FF00FF', belly: '#FFB6C1', shadow: '#C71585' },
                    animationType: 'breathe',
                    animationDuration: '2s'
                };
        }
    };

    const config = getPetConfig(type);
    const { body, belly, shadow } = config.colors;

    const getAnimationStyle = () => {
        if (isFocusing) return { animation: 'float 3s ease-in-out infinite' };

        if (config.animationType === 'mechanical') {
            return { animation: `breathe ${config.animationDuration} steps(2) infinite` };
        } else {
            return { animation: `breathe ${config.animationDuration} ease-in-out infinite` };
        }
    };

    // MICRO-INTERACTION LOGIC
    const [interaction, setInteraction] = useState<string | null>(null);

    useEffect(() => {
        // Trigger animation when lastInteractionTime changes (and it's recent)
        if (Date.now() - lastInteractionTime < 1000) {
            triggerMicroInteraction();
        }
    }, [lastInteractionTime]);

    const triggerMicroInteraction = () => {
        let action = '';
        switch (type) {
            case 'gato': action = 'bostezo'; break;
            case 'perro': action = 'cola'; break;
            case 'dino': action = 'rugido'; break;
            case 'axolote': action = 'burbujas'; break;
            case 'pajaro': action = 'vuelo'; break;
            case 'zorro': action = 'escucha'; break;
            case 'panda': action = 'bambu'; break;
            case 'robot': action = 'scan'; break;
        }
        setInteraction(action);
        setTimeout(() => setInteraction(null), 3000);
    };

    const renderInteraction = () => {
        if (!interaction) return null;

        return (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                {interaction === 'bostezo' && <div className="text-4xl animate-bounce">🥱</div>}
                {interaction === 'cola' && <div className="text-4xl animate-wiggle">🐕❤</div>}
                {interaction === 'rugido' && <div className="text-4xl animate-ping">🦖💕</div>}
                {interaction === 'burbujas' && (
                    <div className="absolute bottom-0 flex gap-2">
                        <div className="w-4 h-4 bg-blue-300 rounded-full animate-float-up delay-0"></div>
                        <div className="w-6 h-6 bg-blue-300 rounded-full animate-float-up delay-100"></div>
                        <div className="w-3 h-3 bg-blue-300 rounded-full animate-float-up delay-200"></div>
                    </div>
                )}
                {interaction === 'vuelo' && <div className="text-4xl animate-spin">🦅</div>}
                {interaction === 'escucha' && <div className="text-4xl animate-pulse">👂🎶</div>}
                {interaction === 'bambu' && <div className="text-4xl animate-bounce">🎋🐼</div>}
                {interaction === 'scan' && <div className="absolute w-full h-1 bg-red-500/50 shadow-[0_0_10px_red] animate-scan-down"></div>}
            </div>
        );
    };

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Habitat Layer */}
            <PetHabitat type={habitatType as HabitatType} />

            <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes scan-down {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
            <div className="absolute bottom-0 w-32 h-8 bg-black/10 rounded-full blur-md transform translate-y-4 scale-x-125"></div>

            {renderInteraction()}

            <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                style={getAnimationStyle()}
                className="drop-shadow-xl z-10"
            >
                {/* ... existing SVG content ... */}
                {config.sideFeatures && <g>{config.sideFeatures}</g>}

                {type === 'robot' ? (
                    <rect x="50" y="50" width="100" height="100" rx="15" fill={body} stroke={shadow} strokeWidth="3" />
                ) : (
                    !isPenalized ? (
                        <path d={config.bodyPath} fill={body} />
                    ) : (
                        <path
                            d="M100 50 C 140 50, 190 90, 180 150 C 170 190, 150 195, 100 195 C 50 195, 30 190, 20 150 C 10 90, 60 50, 100 50 Z"
                            fill="#A9DFBF"
                        />
                    )
                )}

                {config.topFeatures}

                {type !== 'robot' && !isPenalized && (
                    <ellipse cx="100" cy="140" rx="40" ry="25" fill={belly} opacity="0.8" />
                )}

                {type !== 'robot' && !isPenalized && (
                    <path d="M160 110 Q 160 160 100 180" stroke={shadow} strokeWidth="0" fill="none" />
                )}

                <g transform="translate(0, 10)">
                    {isPenalized ? (
                        <>
                            <text x="65" y="100" fontSize="25" fill="#555">x</text>
                            <text x="125" y="100" fontSize="25" fill="#555">x</text>
                            <path d="M 85 130 Q 100 120 115 130" stroke="#555" strokeWidth="3" fill="none" />
                        </>
                    ) : isFocusing ? (
                        <>
                            <path d="M 70 100 Q 80 105 90 100" stroke="#555" strokeWidth="3" fill="none" />
                            <path d="M 110 100 Q 120 105 130 100" stroke="#555" strokeWidth="3" fill="none" />
                            <circle cx="100" cy="125" r="3" fill={belly} opacity="0.6" />
                        </>
                    ) : (
                        <>
                            {config.faceFeatures}

                            {type !== 'robot' && (
                                <>
                                    <ellipse cx="75" cy="100" rx="6" ry={blink ? 0.5 : 8} fill="#333" />
                                    <ellipse cx="125" cy="100" rx="6" ry={blink ? 0.5 : 8} fill="#333" />
                                    {!blink && (
                                        <>
                                            <circle cx="77" cy="96" r="2" fill="white" />
                                            <circle cx="127" cy="96" r="2" fill="white" />
                                        </>
                                    )}
                                </>
                            )}

                            {type !== 'axolote' && type !== 'robot' && (
                                <path d="M 90 125 Q 100 135 110 125" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
                            )}

                            {type !== 'robot' && (
                                <>
                                    <circle cx="65" cy="115" r="5" fill="#FF69B4" opacity="0.4" />
                                    <circle cx="135" cy="115" r="5" fill="#FF69B4" opacity="0.4" />
                                </>
                            )}
                        </>
                    )}
                </g>
            </svg>
        </div>
    );
};
