import React, { ReactNode } from 'react';
import { PetType } from '../data/petData';
import { Snowflake, Lock } from 'lucide-react';

interface PetEnvironmentProps {
    petType: PetType;
    isFrozen: boolean;
    isFocusing: boolean;
    children: ReactNode;
}

export const PetEnvironment = ({ petType, isFrozen, isFocusing, children }: PetEnvironmentProps) => {
    // Environmental Backgrounds
    const backgrounds: Record<PetType, string> = {
        gato: 'bg-orange-50', // Cozy Room (Warm)
        perro: 'bg-green-100', // Park (Fresh)
        dino: 'bg-emerald-900', // Jungle (Deep)
        axolote: 'bg-cyan-900', // Underwater (Dark Blue)
        pajaro: 'bg-sky-200', // Sky (Light Blue)
        zorro: 'bg-amber-100', // Forest (Autumn)
        panda: 'bg-lime-50', // Bamboo (Light Green)
        robot: 'bg-slate-900', // Lab (Dark Grey)
    };

    // Environmental Decor (Simple absolute divs for now, can be SVGs)
    const renderDecor = () => {
        switch (petType) {
            case 'axolote': return (
                <>
                    <div className="absolute bottom-10 left-10 w-8 h-8 rounded-full bg-cyan-400/20 animate-bounce delay-700"></div>
                    <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-cyan-300/30 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/50 to-transparent pointer-events-none"></div>
                </>
            );
            case 'dino': return (
                <>
                    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-emerald-950 to-transparent opacity-60"></div>
                    <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
                </>
            );
            case 'pajaro': return (
                <>
                    <div className="absolute top-10 left-1/4 w-32 h-10 bg-white/40 rounded-full blur-lg"></div>
                    <div className="absolute top-20 right-1/4 w-20 h-8 bg-white/30 rounded-full blur-md"></div>
                </>
            );
            case 'robot': return (
                <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950"></div>
                    <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-cyan-500/20 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 h-full w-[1px] bg-cyan-500/20 animate-pulse"></div>
                </>
            );
            default: return null;
        }
    };

    const baseBg = backgrounds[petType] || 'bg-gray-50';
    const focusBg = 'bg-indigo-900'; // Override when focusing if desired, or keep environment?
    // User requested "ambiente relajado" for meditation. Maybe keep environment but darker?
    // For now, let's keep the environment but dim it if focusing.

    return (
        <div className={`relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden transition-all duration-1000 ${isFocusing ? 'brightness-75' : ''} ${baseBg} shadow-inner`}>

            {/* Environment Layers */}
            {renderDecor()}

            {/* Content (Pet) */}
            <div className={`relative z-10 flex flex-col items-center justify-center h-full transition-all duration-500 ${isFrozen ? 'grayscale opacity-80 blur-[1px]' : ''}`}>
                {children}
            </div>

            {/* Frozen Overlay */}
            {isFrozen && (
                <div className="absolute inset-0 z-20 bg-cyan-200/30 backdrop-blur-[2px] flex flex-col items-center justify-center border-4 border-cyan-300/50 rounded-3xl animate-in fade-in duration-500">
                    <div className="bg-white/90 p-6 rounded-2xl shadow-xl border-b-4 border-cyan-200 text-center max-w-xs transform scale-110">
                        <div className="mx-auto bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Snowflake className="w-8 h-8 text-cyan-600 animate-spin-slow" />
                        </div>
                        <h3 className="text-xl font-black text-cyan-900 mb-2">¡CONGELADO!</h3>
                        <p className="text-cyan-700 text-sm mb-4">
                            Tu mascota está atrapada en el hielo.
                            <br />
                            <span className="font-bold">Termina tus deberes para que tus padres la liberen.</span>
                        </p>
                        <Lock className="w-6 h-6 text-cyan-400 mx-auto" />
                    </div>

                    {/* Hielo decorativo */}
                    <div className="absolute top-0 left-0 text-6xl opacity-50 select-none pointer-events-none">❄️</div>
                    <div className="absolute bottom-0 right-0 text-6xl opacity-50 select-none pointer-events-none">❄️</div>
                </div>
            )}
        </div>
    );
};
