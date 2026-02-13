import React from 'react';
import { X, Shield, Image as ImageIcon, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HabitatType } from './PetHabitat';

interface StoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HABITATS: { id: HabitatType; name: string; price: number }[] = [
    { id: 'mika_room', name: 'Cuarto Acogedor', price: 0 },
    { id: 'bolt_yard', name: 'Patio Soleado', price: 500 },
    { id: 'mati_jungle', name: 'Selva Prehistórica', price: 500 },
    { id: 'sky_aquarium', name: 'Acuario Zen', price: 500 },
    { id: 'shira_sky', name: 'Cielo Despejado', price: 500 },
    { id: 'lalo_forest', name: 'Bosque Otoñal', price: 500 },
    { id: 'pop_bamboo', name: 'Bosque de Bambú', price: 500 },
    { id: 'bit_lab', name: 'Laboratorio Digital', price: 500 },
];

export const StoreModal = ({ isOpen, onClose }: StoreModalProps) => {
    const { coins, streakShields, ownedBackgrounds, buyShield, buyBackground } = useAuth();

    if (!isOpen) return null;

    const handleBuyShield = async () => {
        if (coins < 200) {
            alert("No tienes suficientes monedas.");
            return;
        }
        const result = await buyShield();
        if (result.error) alert(result.error.message);
        else alert("¡Escudo comprado!");
    };

    const handleBuyBackground = async (bgId: string, price: number) => {
        if (coins < price) {
            alert("No tienes suficientes monedas.");
            return;
        }
        const result = await buyBackground(bgId, price);
        if (result.error) alert(result.error.message);
        else alert("¡Fondo desbloqueado!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-indigo-100 flex flex-col">

                {/* Header */}
                <div className="p-6 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            🛍️ Tienda de Recompensas
                        </h2>
                        <p className="text-indigo-200 text-sm">¡Gasta tus monedas sabiamente!</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                            🪙 {coins}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto flex-grow">

                    {/* Section: Objects */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-500" /> Objetos Útiles
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border-2 border-blue-100 bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-blue-900">Escudo de Racha</h4>
                                    <p className="text-xs text-blue-600 mb-2">Protege tu racha 1 día.</p>
                                    <div className="text-sm font-bold text-gray-600">Tienes: {streakShields}/2</div>
                                </div>
                                <button
                                    onClick={handleBuyShield}
                                    disabled={streakShields >= 2 || coins < 200}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {streakShields >= 2 ? "Lleno" : "200 🪙"}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section: Backgrounds */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-purple-500" /> Fondos de Hábitat
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {HABITATS.map((bg) => {
                                const isOwned = ownedBackgrounds.includes(bg.id) || bg.price === 0;
                                return (
                                    <div key={bg.id} className={`relative group border-2 rounded-2xl p-3 flex flex-col items-center gap-2 transition-all ${isOwned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}>
                                        <div className={`w-full h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden ${isOwned ? '' : 'grayscale group-hover:grayscale-0 transition-all'}`}>
                                            {/* Minimal preview placeholder */}
                                            <div className={`w-full h-full opacity-50 ${bg.id === 'mika_room' ? 'bg-orange-100' :
                                                    bg.id === 'bolt_yard' ? 'bg-green-100' :
                                                        bg.id === 'mati_jungle' ? 'bg-emerald-800' :
                                                            bg.id === 'sky_aquarium' ? 'bg-cyan-900' :
                                                                bg.id === 'shira_sky' ? 'bg-sky-200' :
                                                                    bg.id === 'lalo_forest' ? 'bg-amber-100' :
                                                                        bg.id === 'pop_bamboo' ? 'bg-lime-50' :
                                                                            'bg-slate-800'
                                                }`}></div>
                                            {!isOwned && <Lock className="absolute w-8 h-8 text-gray-400" />}
                                        </div>

                                        <div className="text-center w-full">
                                            <div className="font-bold text-sm text-gray-700 truncate">{bg.name}</div>
                                            {isOwned ? (
                                                <div className="text-xs text-green-600 font-bold flex items-center justify-center gap-1 mt-1">
                                                    <Check className="w-3 h-3" /> Adquirido
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleBuyBackground(bg.id, bg.price)}
                                                    className="mt-2 w-full py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors"
                                                >
                                                    {bg.price} 🪙
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
