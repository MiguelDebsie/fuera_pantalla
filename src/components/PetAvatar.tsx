import React from 'react';
import { PetType, PETS } from '../data/petData';
import { calculateProgressToNextLevel } from '../utils/gameLogic';

interface PetAvatarProps {
    type: PetType;
    level: number;
    xp: number;
    isPenalized: boolean; // Si está enfermo/triste
}

export const PetAvatar: React.FC<PetAvatarProps> = ({ type, level, xp, isPenalized }) => {
    const pet = PETS[type];

    // Determinar fase evolutiva (cada 20 niveles cambia de forma para demo, o menos)
    // Para el prototipo: Nivel 0-4 (Fase 1), 5-9 (Fase 2), etc.
    // Formula ajustada para ver evolución rápida en test
    const stageIndex = Math.min(pet.stages.length - 1, Math.floor(level / 5));
    const currentEmoji = pet.stages[stageIndex];

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h2>

            <div className="text-8xl mb-4 transition-transform transform hover:scale-110 duration-300">
                {isPenalized ? '🤢' : currentEmoji}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgressToNextLevel(xp, level)}%` }}
                />
            </div>

            <p className="text-sm text-gray-500 font-mono">
                Lvl {level} | XP: {xp}
            </p>

            {isPenalized && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-bold animate-pulse">
                    ¡Está enfermo! Necesitas curarlo.
                </div>
            )}
        </div>
    );
};
