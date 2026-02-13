import React from 'react';

interface TestControlsProps {
    onAddXP: (amount: number) => void;
    onPenalize: () => void;
    onRestore: () => void;
    onReset: () => void;
}

export const TestControls: React.FC<TestControlsProps> = ({ onAddXP, onPenalize, onRestore, onReset }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 border-t-4 border-indigo-500 shadow-2xl z-50">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h3 className="font-bold text-indigo-300 uppercase tracking-wider text-xs">Modo de Prueba (Dios)</h3>
                    <p className="text-xs text-gray-400">Controla el tiempo y el destino.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onAddXP(100)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                    >
                        +100 XP (Simular 1h)
                    </button>

                    <button
                        onClick={() => onAddXP(1000)}
                        className="px-3 py-1 bg-green-800 hover:bg-green-900 rounded text-xs transition-colors"
                    >
                        +1000 XP (Massive Boost)
                    </button>

                    <button
                        onClick={onPenalize}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                    >
                        Provocar Desastre (Penalizar)
                    </button>

                    <button
                        onClick={onRestore}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                    >
                        Restaurar (Ver Anuncio)
                    </button>

                    <button
                        onClick={onReset}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors"
                    >
                        Reset Total
                    </button>
                </div>
            </div>
        </div>
    );
};
