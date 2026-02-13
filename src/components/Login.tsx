import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, KeyRound, ChevronLeft, Plus } from 'lucide-react';

export const Login = () => {
    const { signInAsChild, signInAsParent, signUp, familyMembers } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'child' | 'parent'>('child');
    const [isRegistering, setIsRegistering] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const handleChildLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChildId) return;

        const success = await signInAsChild(selectedChildId, pin);
        if (!success) setError('PIN Incorrecto');
    };



    const handleParentRegister = async () => {
        const email = prompt("Email para registrar:");
        const password = prompt("Contraseña nueva:");
        if (email && password) {
            const { error } = await signUp(email, password);
            if (error) {
                alert("Error: " + error.message);
            } else {
                alert("Registro exitoso. ¡Revisa tu correo para confirmar!");
                setIsRegistering(false);
            }
        }
    };

    const children = familyMembers.filter(m => m.role === 'child');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold text-indigo-900 mb-2">Focus Buddy Family</h1>

                {/* Header Mode Selector */}
                {!selectedChildId && (
                    <>
                        <p className="text-gray-500 mb-8">Selecciona tu perfil</p>
                        <div className="flex justify-center gap-4 mb-8">
                            <button
                                onClick={() => { setMode('child'); setIsRegistering(false); }}
                                className={`p-4 rounded-xl border-2 transition-all ${mode === 'child' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                            >
                                <User className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                                <span className="block font-bold text-sm">Soy Hijo/a</span>
                            </button>
                            <button
                                onClick={() => setMode('parent')}
                                className={`p-4 rounded-xl border-2 transition-all ${mode === 'parent' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                            >
                                <KeyRound className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <span className="block font-bold text-sm">Soy Padre</span>
                            </button>
                        </div>
                    </>
                )}

                {/* CHILD MODE */}
                {mode === 'child' && (
                    <div>
                        {!selectedChildId ? (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                                {children.length > 0 ? children.map(child => (
                                    <button
                                        key={child.id}
                                        onClick={() => { setSelectedChildId(child.id); setError(''); setPin(''); }}
                                        className="p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-100 hover:border-indigo-300 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-2xl group-hover:scale-110 transition-transform">
                                            🐣
                                        </div>
                                        <span className="font-bold text-indigo-900 block truncate">{child.name}</span>
                                    </button>
                                )) : (
                                    <div className="col-span-2 text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p className="text-sm mb-2">No hay perfiles creados</p>
                                        <p className="text-xs">Pide a papá/mamá que cree tu perfil desde su cuenta.</p>
                                    </div>
                                )}

                                {/* Fallback temporal si no hay hijos pero es la primera vez (bootstrapping o guest) */}
                                {children.length === 0 && (
                                    <button
                                        onClick={() => {
                                            // Trigger guest/demo login
                                            const demoPin = prompt("PIN Demo (1234):");
                                            if (demoPin === '1234') signInAsChild('guest', '1234');
                                        }}
                                        className="col-span-2 text-xs text-indigo-400 mt-4 hover:underline"
                                    >
                                        Usar Modo Demo (PIN 1234)
                                    </button>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleChildLogin} className="animate-in zoom-in-50">
                                <button
                                    type="button"
                                    onClick={() => setSelectedChildId(null)}
                                    className="absolute top-8 left-8 text-gray-400 hover:text-indigo-600"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-indigo-900">Hola, {children.find(c => c.id === selectedChildId)?.name}</h2>
                                    <p className="text-gray-500 text-sm">Ingresa tu PIN secreto</p>
                                </div>

                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="****"
                                    autoFocus
                                    className="w-full text-center text-3xl tracking-[1em] font-mono p-4 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none mb-4"
                                />
                                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={pin.length < 4}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                                >
                                    DESBLOQUEAR
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* PARENT MODE */}
                {mode === 'parent' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                        <p className="text-sm text-gray-500">Acceso administrativo para gestionar suscripción y tiempos.</p>

                        {!isRegistering ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                                const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                                const result = await signInAsParent(email, password);
                                if (result?.error) setError(result.error.message);
                            }} className="space-y-3">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-colors"
                                    required
                                />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-purple-500 outline-none transition-colors"
                                    required
                                />
                                {error && <p className="text-red-500 text-xs">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                >
                                    INICIAR SESIÓN
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Implementación de Registro en proceso...</p>
                                <button onClick={() => setIsRegistering(false)} className="text-purple-600 text-sm font-bold mt-2">Volver al Login</button>
                            </div>
                        )}

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {!isRegistering && (
                            <button
                                onClick={handleParentRegister}
                                className="w-full bg-white text-purple-600 border-2 border-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all"
                            >
                                CREAR CUENTA
                            </button>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={async () => {
                                    const code = prompt("Ingresa el CÓDIGO DE FAMILIA de tu pareja:");
                                    if (code) {
                                        // login first if needed or handle logic? 
                                        // Actually, joinFamily requires AUTH.
                                        // Assuming flow: Register/Login -> Then Join. 
                                        // But here we are in Login screen.
                                        // Alternative: "Ya tengo cuenta, quiero unirme".
                                        // For simplicity: Alert user they must be logged in to join.
                                        alert("Primero inicia sesión o regístrate, luego verás la opción de unirte en el Panel.");
                                    }
                                }}
                                className="text-xs text-gray-400 underline hover:text-purple-600"
                            >
                                ¿Tienes un código de invitación?
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
