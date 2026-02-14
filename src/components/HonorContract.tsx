import React, { useState } from 'react';
import { Scroll, PenTool, Check } from 'lucide-react';

interface HonorContractProps {
    childName: string;
    onSign: () => void;
}

export const HonorContract = ({ childName, onSign }: HonorContractProps) => {
    const [nameInput, setNameInput] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    const isComplete = isChecked && nameInput.trim().toLowerCase() === childName.toLowerCase();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isComplete) {
            onSign();
        }
    };

    return (
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-indigo-900 animate-in fade-in overflow-y-auto h-screen w-full">
            {/* Spacer top para que no quede pegado arriba en móviles */}
            <div className="w-full shrink-0 h-10 md:h-20"></div>

            <div className="bg-white rounded-3xl max-w-lg w-[90%] md:w-full p-6 md:p-8 shadow-2xl relative overflow-hidden border-8 border-yellow-400 shrink-0 mb-96">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-4 bg-yellow-400"></div>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-200">
                        <Scroll className="w-8 h-8 md:w-10 md:h-10 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-indigo-900 uppercase tracking-wide">Contrato de Honor</h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Compromiso de Foco y Disciplina</p>
                </div>

                <div className="bg-orange-50 p-4 md:p-6 rounded-xl border border-orange-100 mb-6 font-serif text-base md:text-lg leading-relaxed text-gray-800 italic">
                    <p className="mb-4">
                        "Yo, <strong className="text-indigo-700 underline decoration-wavy decoration-indigo-300">{childName}</strong>, prometo dedicar mi esfuerzo y atención a mis tareas de hoy."
                    </p>
                    <p>
                        "Entiendo que el enfoque es mi superpoder y que cada minuto cuenta para lograr mis metas y hacer crecer a mi mascota."
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                            {isChecked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <span className="font-bold text-gray-600 text-sm">Acepto el desafío sin distracciones</span>
                    </label>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Firma Digital (Escribe tu nombre)</label>
                        <div className="relative">
                            <PenTool className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder={childName}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl font-handwriting text-2xl text-indigo-800 focus:border-indigo-500 outline-none transition-colors"
                                autoComplete="off"
                            />
                        </div>
                        {!isComplete && nameInput.length > 0 && nameInput.toLowerCase() !== childName.toLowerCase() && (
                            <p className="text-red-400 text-xs mt-2 pl-2">Por favor escribe "{childName}" para firmar.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isComplete}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-95"
                    >
                        SELLAR COMPROMISO 🛡️
                    </button>

                    {/* Extra space for scrolling functionality on small screens with keyboard */}
                    <div className="h-10 md:hidden"></div>
                </form>

            </div>
        </div>
    );
    );
};
