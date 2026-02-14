import { useState, useEffect, useRef } from 'react';
import { calculateLevel } from '../utils/gameLogic';
import { PetType } from '../data/petData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface GameState {
    xp: number;
    petType: PetType;
    isPenalized: boolean; // Si el edificio está quemado o mascota enferma
    lastFocusTime: number; // Timestamp
    buildingsBuilt: number;
    mood: string;
}

const INITIAL_STATE: GameState = {
    xp: 0,
    petType: 'gato', // Default
    isPenalized: false,
    lastFocusTime: Date.now(),
    buildingsBuilt: 0,
    mood: 'neutral'
};

export const useFocusEngine = () => {
    const { user, refreshProfile } = useAuth();

    // Estado local optimista
    const [gameState, setGameState] = useState<GameState>(() => {
        try {
            const saved = localStorage.getItem('focus-game-state');
            return saved ? JSON.parse(saved) : INITIAL_STATE;
        } catch (e) {
            console.error("Error parsing game state:", e);
            return INITIAL_STATE;
        }
    });

    const [isFocusing, setIsFocusing] = useState(() => {
        return localStorage.getItem('isFocusing') === 'true';
    });
    const [focusTimeElapsed, setFocusTimeElapsed] = useState(0);
    const [targetDuration, setTargetDuration] = useState(() => {
        const saved = localStorage.getItem('targetDuration');
        return saved ? parseInt(saved) : 25;
    });
    const [lastCompletedSession, setLastCompletedSession] = useState<number | null>(null);

    // Persistencia Local de Game State
    useEffect(() => {
        localStorage.setItem('focus-game-state', JSON.stringify(gameState));
    }, [gameState]);

    // Persistencia Local de Focus State (para sobrevivir recargas/crash)
    useEffect(() => {
        localStorage.setItem('isFocusing', isFocusing.toString());
        localStorage.setItem('targetDuration', targetDuration.toString());
    }, [isFocusing, targetDuration]);

    const lastCoinAwardTime = useRef<number>(0);

    // Timer de sesión basado en Timestamps (Soporte Pantalla Apagada)
    useEffect(() => {
        let interval: any;

        if (isFocusing && !gameState.isPenalized) {
            // Guardar tiempo de inicio si no existe
            const startTimeStr = localStorage.getItem('focus-start-time');
            let startTime = startTimeStr ? parseInt(startTimeStr) : Date.now();

            if (!startTimeStr) {
                // Si estamos iniciando, guardamos el start time
                // IMPORTANTE: Si recuperamos 'isFocusing' true del storage pero no hay start-time (raro), reiniciamos
                localStorage.setItem('focus-start-time', startTime.toString());
            }

            interval = setInterval(() => {
                const now = Date.now();
                const totalElapsedSeconds = Math.floor((now - startTime) / 1000);

                setFocusTimeElapsed(totalElapsedSeconds);

                // INCREMENTAL REWARD: Every 60 seconds
                if (totalElapsedSeconds > 0 && totalElapsedSeconds % 60 === 0 && user?.id && (now - lastCoinAwardTime.current > 5000)) {
                    lastCoinAwardTime.current = now;
                    const awardIncremental = async () => {
                        try {
                            const userPin = user.pin || null;
                            await (supabase.rpc as any)('award_coins', {
                                p_user_id: user.id,
                                p_amount: 1,
                                p_pin: userPin
                            });
                            refreshProfile();
                        } catch (err) {
                            console.error("Error awarding incremental coin:", err);
                        }
                    };
                    awardIncremental();
                }

                if (totalElapsedSeconds >= targetDuration * 60) {
                    // ÉXITO: Sesión completada
                    if (user?.id) {
                        const awardBonus = async () => {
                            try {
                                const userPin = user.pin || null;
                                await (supabase.rpc as any)('award_coins', {
                                    p_user_id: user.id,
                                    p_amount: targetDuration,
                                    p_pin: userPin
                                });
                                refreshProfile();
                            } catch (err) {
                                console.error("Error awarding bonus coins:", err);
                            }
                        };
                        awardBonus();
                    }

                    setGameState(s => ({
                        ...s,
                        xp: s.xp + (targetDuration * 10),
                        mood: 'happy'
                    }));

                    // Limpieza
                    setIsFocusing(false);
                    localStorage.removeItem('focus-start-time');
                    // localStorage.removeItem('isFocusing'); // handled by effect
                    setLastCompletedSession(targetDuration);
                }
            }, 1000);
        } else {
            localStorage.removeItem('focus-start-time');
        }

        return () => clearInterval(interval);
    }, [isFocusing, gameState.isPenalized, targetDuration, user]);

    // Detección de Fuga ELIMINADA para permitir apagar pantalla
    // La app confía en que el usuario está "Focusing" si la sesión está activa.
    // Solo se penaliza si el usuario cancela manualmente.

    // Heartbeat (Presence)
    useEffect(() => {
        if (!user?.id) return;

        // Función para reportar presencia
        const reportPresence = async () => {
            const activity = isFocusing ? 'focusing' : 'idle';
            const { error } = await supabase.from('user_presence').upsert({
                user_id: user.id,
                last_seen_at: new Date().toISOString(),
                current_activity: activity,
                current_pet_mood: gameState.mood
            } as any);
            if (error) console.error("Error reporting presence:", error);
        };

        // Reportar inmediatamente y luego cada 60s
        reportPresence();
        const interval = setInterval(reportPresence, 60000);

        return () => clearInterval(interval);
    }, [user, isFocusing, gameState.mood]);


    // --- ACTIONS ---

    const startSession = () => {
        setIsFocusing(true);
        setFocusTimeElapsed(0);
        // Resetear mood o estado si es necesario
    };

    const endSession = () => {
        setIsFocusing(false);
        setFocusTimeElapsed(0);
        // Podríamos aplicar una pequeña penalización por abandonar? 
        // Por ahora no, para ser amables.
    };

    const selectPet = (type: PetType) => {
        setGameState(prev => ({
            ...prev,
            petType: type
        }));
    };

    const restoreState = () => {
        setGameState(INITIAL_STATE);
        localStorage.removeItem('focus-game-state');
        window.location.reload();
    };

    const debugAddXP = (amount: number) => {
        setGameState(prev => ({ ...prev, xp: prev.xp + amount }));
    };

    const debugSetPenalized = (penalized: boolean) => {
        setGameState(prev => ({ ...prev, isPenalized: penalized }));
    };

    const healPet = () => {
        setGameState(prev => ({
            ...prev,
            isPenalized: false,
            mood: 'neutral'
        }));
    };

    return {
        gameState,
        level: calculateLevel(gameState.xp),
        isFocusing,
        focusTimeElapsed,
        targetDuration,
        setTargetDuration,
        progress: targetDuration > 0 ? Math.min(100, (focusTimeElapsed / (targetDuration * 60)) * 100) : 0,
        startSession,
        endSession,
        selectPet,
        restoreState,
        debugAddXP,
        debugSetPenalized,
        healPet,
        lastCompletedSession,
        setLastCompletedSession
    };
};
