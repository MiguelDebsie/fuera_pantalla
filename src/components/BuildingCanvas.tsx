import React from 'react';
import { BUILDING_STAGES } from '../data/petData';

interface BuildingCanvasProps {
    level: number; // Nivel global que afecta al edificio
    isPenalized: boolean; // Si está en llamas
}

export const BuildingCanvas: React.FC<BuildingCanvasProps> = ({ level, isPenalized }) => {
    // Evolución de edificios un poco más lenta que mascotas
    const stageIndex = Math.min(BUILDING_STAGES.length - 1, Math.floor(level / 8));
    const currentBuilding = BUILDING_STAGES[stageIndex];

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border-2 border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Imperio de Enfoque</h2>

            <div className="text-8xl mb-4 transition-transform transform hover:scale-110 duration-300 relative">
                {currentBuilding}
                {isPenalized && (
                    <span className="absolute top-0 right-0 text-6xl animate-bounce">🔥</span>
                )}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(level % 8) * 12.5}%` }} // Progreso cíclico para edificios
                />
            </div>

            <p className="text-sm text-gray-500 font-mono">
                Fase {stageIndex + 1}
            </p>

            {isPenalized && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-bold animate-pulse">
                    ¡INCENDIO! ¡Restaura tu imperio!
                </div>
            )}
        </div>
    );
};
