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

    const [isFocusing, setIsFocusing] = useState(false);
    const [focusTimeElapsed, setFocusTimeElapsed] = useState(0);
    const [targetDuration, setTargetDuration] = useState(25);
    const [lastCompletedSession, setLastCompletedSession] = useState<number | null>(null);

    // Persistencia Local
    useEffect(() => {
        localStorage.setItem('focus-game-state', JSON.stringify(gameState));
    }, [gameState]);

    const lastCoinAwardTime = useRef<number>(0);

    // Timer de sesión
    useEffect(() => {
        let interval: any;
        if (isFocusing && !gameState.isPenalized) {
            interval = setInterval(() => {
                setFocusTimeElapsed(prev => {
                    const newTime = prev + 1;

                    // INCREMENTAL REWARD: Every 60 seconds, award 1 coin directly
                    // GUARD: Ensure we don't double-award within a short window (e.g. duplicate intervals)
                    const now = Date.now();
                    if (newTime % 60 === 0 && user?.id && (now - lastCoinAwardTime.current > 5000)) {
                        lastCoinAwardTime.current = now; // Mark as awarded

                        const awardIncremental = async () => {
                            try {
                                console.log("[FocusEngine] Attempting to award incremental coin...", user.id);
                                // Use PIN from context if available (Child Mode)
                                const userPin = user.pin || null;

                                const { error: rpcError } = await (supabase.rpc as any)('award_coins', {
                                    p_user_id: user.id,
                                    p_amount: 1,
                                    p_pin: userPin
                                });

                                if (rpcError) {
                                    console.error("[FocusEngine] RPC Error awarding coin:", rpcError);
                                } else {
                                    console.log("[FocusEngine] Coin awarded successfully via RPC!");
                                    refreshProfile();
                                }
                            } catch (err) {
                                console.error("Error awarding incremental coin:", err);
                            }
                        };
                        awardIncremental();
                    }

                    if (newTime >= targetDuration * 60) {
                        // ÉXITO: Sesión completada
                        // BONUS REWARD: Award coins equal to session duration (e.g. 25 mins = 25 coins)
                        if (user?.id) {
                            const awardBonus = async () => {
                                try {
                                    console.log(`[FocusEngine] Awarding SESSION BONUS: ${targetDuration} coins`);
                                    const userPin = user.pin || null;
                                    await (supabase.rpc as any)('award_coins', {
                                        p_user_id: user.id,
                                        p_amount: targetDuration, // Bonus amount = duration
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
                            xp: s.xp + (targetDuration * 10), // XP Bonus
                            mood: 'happy'
                        }));
                        setIsFocusing(false);
                        setLastCompletedSession(targetDuration);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFocusing, gameState.isPenalized, targetDuration, user]);

    // Detección de Fuga (Tab Change)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && isFocusing) {
                // Usuario cambió de pestaña mientras se enfocaba!

                // 1. Log Distraction
                if (user?.id) {
                    supabase.from('distractions').insert([{
                        user_id: user.id,
                        detected_at: new Date().toISOString(),
                        duration_seconds: 0 // Could calc diff
                    }] as any).then(({ error }) => {
                        if (error) console.error("Error logging distraction:", error);
                    });

                    // 2. Award Partial Coins (1 coin per minute completed)
                    const minutesFocused = Math.floor(focusTimeElapsed / 60);
                    console.log(`[FocusEngine] Distraction! Elapsed: ${focusTimeElapsed}s, Minutes: ${minutesFocused}`);

                    if (minutesFocused > 0) {
                        try {
                            // Find PIN for authorization (if child mode)
                            const userPin = user.pin || null;

                            const { error: rpcError } = await (supabase.rpc as any)('award_coins', {
                                p_user_id: user.id,
                                p_amount: minutesFocused,
                                p_pin: userPin
                            });

                            if (rpcError) console.error("[FocusEngine] Error awarding coins via RPC:", rpcError);
                            else console.log("[FocusEngine] Coins awarded successfully via RPC!");

                        } catch (err) {
                            console.error("[FocusEngine] Unexpected error awarding coins:", err);
                        }
                    } else {
                        console.log("[FocusEngine] No coins awarded (< 1 min).");
                    }
                }

                // 3. Penalizar
                setIsFocusing(false);
                setFocusTimeElapsed(0);
                setGameState(prev => ({
                    ...prev,
                    mood: 'sad',
                    isPenalized: true // Requiere "Curar" para volver a empezar
                }));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isFocusing, user, focusTimeElapsed]);

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
