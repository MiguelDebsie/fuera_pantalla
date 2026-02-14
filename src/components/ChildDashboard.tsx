import { useState, useEffect } from 'react';
import { useFocusEngine } from '../hooks/useFocusEngine';
import { CutePet } from './CutePet';
import { PetEnvironment } from './PetEnvironment';
import { StoreModal } from './StoreModal';
import { SessionSummary } from './SessionSummary';
import { PETS, PetType } from '../data/petData';
import { Trophy, Heart, LogOut, ShoppingBag, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

// ... imports

// Componente para que el hijo vea y complete sus misiones
const ChildTaskList = ({ userId, familyId }: { userId: string, familyId: string }) => {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;
        const fetchTasks = async () => {
            // Fetch assigned tasks or tasks for everyone (assigned_to is null)
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('family_id', familyId)
                .or(`assigned_to.eq.${userId},assigned_to.is.null`)
                .neq('status', 'approved'); // Hide already approved/archived
            if (data) setTasks(data);
        };
        fetchTasks();

        const channel = supabase.channel('my-tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, familyId]);

    const handleComplete = async (task: any) => {
        // Mark as 'completed' (waiting for parent approval)
        const { error } = await (supabase.from('tasks') as any).update({ status: 'completed' }).eq('id', task.id);
        if (error) alert(error.message);
        else alert("¡Misión enviada a revisión!");
    };

    return (
        <div className="w-full max-w-md mt-6 mb-8">
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" /> Misiones
            </h3>
            <div className="space-y-2">
                {tasks.length === 0 && <p className="text-gray-400 text-sm italic text-center bg-white p-4 rounded-xl shadow-sm">No tienes misiones pendientes.</p>}
                {tasks.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{t.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                {t.status === 'completed' ? 'Esperando Aprobación' : 'Pendiente'}
                            </span>
                        </div>
                        {t.status !== 'completed' && (
                            <button
                                onClick={() => handleComplete(t)}
                                className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200 transition-colors"
                                title="Marcar como lista"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

import { HonorContract } from './HonorContract';

// ... other imports

export const ChildDashboard = () => {
    const { signOut, user, familyMembers, coins, familyStatus, freezeEndsAt } = useAuth();
    const currentMember = familyMembers.find((m: any) => m.id === user?.id);
    const [isStoreOpen, setIsStoreOpen] = useState(false);

    // Honor Contract State
    const [hasSignedContract, setHasSignedContract] = useState(() => {
        const today = new Date().toDateString();
        const lastSigned = localStorage.getItem(`honor_contract_${user?.id}`);
        return lastSigned === today;
    });

    const handleSignContract = () => {
        const today = new Date().toDateString();
        localStorage.setItem(`honor_contract_${user?.id}`, today);
        setHasSignedContract(true);
    };

    // Timer for Freeze
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    // ... existing freeze effect ...
    useEffect(() => {
        if (familyStatus === 'locked' && freezeEndsAt) {
            const interval = setInterval(() => {
                const diff = new Date(freezeEndsAt).getTime() - Date.now();
                if (diff <= 0) {
                    setTimeRemaining('');
                } else {
                    const mins = Math.floor(diff / 60000);
                    const secs = Math.floor((diff % 60000) / 1000);
                    setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [familyStatus, freezeEndsAt]);

    const {
        gameState,
        // ... rest of hook
        level,
        isFocusing,
        focusTimeElapsed,
        targetDuration,
        setTargetDuration,
        progress,
        startSession,
        endSession,
        selectPet,
        healPet,
        lastCompletedSession,
        setLastCompletedSession
    } = useFocusEngine();

    // ... existing constants and helper functions

    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
    const [showMotivation, setShowMotivation] = useState<string | null>(null);

    const HABITAT_MAPPING: Record<PetType, string> = {
        gato: 'mika_room',
        perro: 'bolt_yard',
        dino: 'mati_jungle',
        axolote: 'sky_aquarium',
        pajaro: 'shira_sky',
        zorro: 'lalo_forest',
        panda: 'pop_bamboo',
        robot: 'bit_lab',
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const adjustTime = (amount: number) => {
        setTargetDuration(prev => {
            const newVal = prev + amount;
            if (newVal < 5) return 5;
            if (newVal > 120) return 120;
            return newVal;
        });
    };

    // ... existing effects

    // MICRO-INTERACTIONS CLOCK
    useEffect(() => {
        let interval: any;
        if (isFocusing) {
            // Trigger every 1 minute (60 seconds)
            // We use a separate interval here to drive the UI animation trigger independent of the main engine
            interval = setInterval(() => {
                setLastInteractionTime(Date.now());
            }, 60000); // 60,000 ms = 1 minute
        }
        return () => clearInterval(interval);
    }, [isFocusing]);

    // REALTIME CHEERS SUBSCRIPTION
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('public:family_cheers')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'family_cheers',
                    filter: `to_user_id=eq.${user.id}`
                },
                (payload) => {
                    const msg = payload.new.message;
                    if (msg) {
                        setShowMotivation(msg);
                        // Ocultar después de 5-8 segundos
                        setTimeout(() => setShowMotivation(null), 8000);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.id]);

    // RENDER
    return (
        <div className={`min-h-screen w-full transition-colors duration-1000 ${isFocusing ? 'bg-gradient-to-b from-indigo-900 to-purple-800' : 'bg-gradient-to-b from-blue-50 to-indigo-50'} flex flex-col items-center p-6 relative overflow-y-auto font-sans pb-20`}>

            {/* MANDATORY HONOR CONTRACT */}
            {!hasSignedContract && !isFocusing && (
                <HonorContract
                    childName={currentMember?.name || 'Hijo'}
                    onSign={handleSignContract}
                />
            )}

            {/* FAMILY LOCK OVERLAY */}
            {familyStatus === 'locked' && (
                <div className="fixed inset-0 z-50 bg-indigo-900 text-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="relative w-64 h-64 mb-6">
                        <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse blur-xl"></div>
                        <CutePet
                            type={gameState.petType}
                            isPenalized={false}
                            isFocusing={true}
                            habitatType="simple_gradient"
                            lastInteractionTime={Date.now()}
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 font-display">Tiempo en Familia</h1>
                    <p className="text-xl text-indigo-200 mb-8 max-w-md">
                        ¡Es momento de desconectar para conectar! <br />
                        {PETS[gameState.petType].name} está meditando contigo.
                    </p>

                    {/* Timer Display */}
                    {timeRemaining && (
                        <div className="bg-white/20 px-6 py-3 rounded-full backdrop-blur-md border border-white/30">
                            <p className="text-2xl font-mono font-bold tracking-widest">{timeRemaining}</p>
                            <p className="text-xs text-indigo-200 uppercase tracking-widest mt-1">Tiempo Restante</p>
                        </div>
                    )}
                </div>
            )}

            {/* Background Particles ... */}
            {
                isFocusing && (
                    <div className="absolute inset-0 pointer-events-none">
                        {/* ... keep existing ... */}
                        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-150"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                )
            }

            {/* Header - Always Visible now to show coins during focus */}
            <header className="w-full max-w-md flex justify-between items-center mb-8 z-10 transition-opacity duration-500">
                <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    {/* Animate coins update? */}
                    <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 font-bold text-sm shadow-inner border border-yellow-200 transaction-all">
                        {coins} 🪙
                    </div>
                </div>

                {!isFocusing && (
                    <div className="flex items-center gap-2 animate-in fade-in">
                        <button
                            onClick={() => setIsStoreOpen(true)}
                            className="bg-white p-2 rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                            <span className="font-bold text-gray-700">Nvl {level}</span>
                        </div>
                        <button onClick={signOut} className="bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-red-500">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </header>

            <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />

            {
                lastCompletedSession && (
                    <SessionSummary
                        durationMinutes={lastCompletedSession}
                        onClose={() => setLastCompletedSession(null)}
                    />
                )
            }

            {/* Main Content */}
            <main className="w-full max-w-md z-10 flex-grow flex flex-col items-center">

                {/* PET DISPLAY AREA */}
                <div className="relative mb-8 transform transition-all duration-500 hover:scale-105 w-full max-w-sm h-96 flex justify-center items-center">

                    {/* Floating Motivation Message */}
                    {showMotivation && (
                        <div className="absolute top-10 z-50 animate-bounce bg-white/90 px-4 py-2 rounded-full shadow-lg text-indigo-600 font-bold border-2 border-indigo-100 whitespace-nowrap">
                            {showMotivation}
                        </div>
                    )}

                    <PetEnvironment
                        petType={gameState.petType}
                        isFrozen={currentMember?.is_frozen || false}
                        isFocusing={isFocusing}
                    >
                        <CutePet
                            type={gameState.petType}
                            isPenalized={gameState.isPenalized}
                            isFocusing={isFocusing}
                            habitatType={HABITAT_MAPPING[gameState.petType]}
                            lastInteractionTime={lastInteractionTime}
                        />
                    </PetEnvironment>

                    {/* Nombre de la Mascota */}
                    {!isFocusing && (
                        <div className="text-center mt-[-20px] relative z-20">
                            <h2 className="text-xl font-bold text-gray-700 capitalize drop-shadow-sm bg-white/80 rounded-full px-4 py-1 mx-auto w-max backdrop-blur-sm">
                                {PETS[gameState.petType].name} <span className="text-sm font-normal text-gray-500">(Nvl {level})</span>
                            </h2>
                            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto mt-2 overflow-hidden border border-white">
                                <div className="bg-green-400 h-full w-[45%]"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pet Selector (Mini) - Disable if Frozen */}
                {!isFocusing && !currentMember?.is_frozen && (
                    <div className="flex gap-3 overflow-x-auto pb-4 mb-6 w-full px-2 scrollbar-hide justify-center">
                        {(Object.keys(PETS) as PetType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => selectPet(type)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${gameState.petType === type
                                    ? 'border-indigo-500 bg-indigo-100 scale-110 shadow-md'
                                    : 'border-transparent bg-white shadow-sm hover:scale-110'
                                    } `}
                                title={type}
                            >
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type === 'gato' ? '#FFD1DC' : type === 'dino' ? '#98FB98' : '#E6E6FA' }}></div>
                            </button>
                        ))}
                    </div>
                )}

                {/* CONTROLS AREA */}
                <div className="w-full">
                    {isFocusing ? (
                        <div className="flex flex-col items-center">
                            <div className="text-center mb-8">
                                <div className="text-6xl font-mono font-bold text-white mb-2 tracking-widest drop-shadow-lg">
                                    {formatTime(focusTimeElapsed)}
                                </div>
                                <p className="text-purple-200 text-sm animate-pulse">
                                    {PETS[gameState.petType].name} está meditando contigo...
                                </p>
                            </div>

                            <div className="w-64 bg-black/20 h-2 rounded-full mb-8 overflow-hidden backdrop-blur-sm">
                                <div
                                    className="bg-white/80 h-full transition-all duration-1000 ease-linear box-shadow-[0_0_10px_white]"
                                    style={{ width: `${progress}% ` }}
                                />
                            </div>

                            <button
                                onClick={endSession}
                                className="text-white/50 hover:text-white border border-white/20 hover:bg-white/10 px-6 py-2 rounded-full text-sm transition-all"
                            >
                                Cancelar Sesión
                            </button>
                        </div>
                    ) : (
                        <div className={`bg-white p-6 rounded-2xl shadow-xl w-full border border-gray-100 transition-all ${currentMember?.is_frozen ? 'opacity-50 pointer-events-none grayscale' : ''} `}>
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => adjustTime(-5)} className="text-gray-400 hover:text-indigo-600 font-bold text-2xl px-4">-</button>
                                <div className="text-center">
                                    <span className="text-4xl font-black text-indigo-600">{targetDuration}</span>
                                    <span className="text-gray-400 text-sm block">minutos</span>
                                </div>
                                <button onClick={() => adjustTime(5)} className="text-gray-400 hover:text-indigo-600 font-bold text-2xl px-4">+</button>
                            </div>

                            <input
                                type="range"
                                min="5"
                                max="120"
                                step="5"
                                value={targetDuration}
                                onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer mb-8 accent-indigo-500"
                            />

                            <button
                                onClick={() => gameState.isPenalized ? healPet() : startSession()}
                                disabled={currentMember?.is_frozen}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${gameState.isPenalized
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/40'
                                    : currentMember?.is_frozen
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40'
                                    } `}
                            >
                                {gameState.isPenalized ? 'CURAR MASCOTA' : 'COMENZAR ENFOQUE'}
                            </button>
                        </div>
                    )}
                </div>

                {!isFocusing && (
                    <ChildTaskList userId={user?.id} familyId={currentMember?.family_id} />
                )}
            </main>
        </div >
    );
};
