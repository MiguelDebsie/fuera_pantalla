import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

type UserRole = 'parent' | 'child' | null;

interface AuthContextType {
    user: any | null;
    role: UserRole;
    loading: boolean;
    signInAsParent: (email?: string, password?: string) => Promise<any>;
    signInAsChild: (memberId: string, pin: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<any>;
    addChild: (name: string, pin: string) => Promise<any>;
    joinFamily: (code: string) => Promise<any>;
    initializeFamily: () => Promise<any>;
    toggleFamilyStatus: (status: 'active' | 'locked') => Promise<void>;
    toggleFreeze: (memberId: string, isFrozen: boolean) => Promise<void>;
    familyMembers: any[];
    familyStatus: 'active' | 'locked';
    isOnline: boolean;
    coins: number;
    streakShields: number;
    ownedBackgrounds: string[];
    inviteCode: string | null;
    buyShield: () => Promise<any>;
    buyBackground: (bgName: string, price: number) => Promise<any>;
    freezeEndsAt: string | null;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    signInAsParent: async () => { },
    signInAsChild: async () => false,
    signOut: async () => { },
    signUp: async () => ({}),
    addChild: async () => ({}),
    joinFamily: async () => ({}),
    initializeFamily: async () => ({}),
    toggleFamilyStatus: async () => { },
    toggleFreeze: async () => { },
    familyMembers: [],
    familyStatus: 'active',
    isOnline: false,
    coins: 0,
    streakShields: 0,
    ownedBackgrounds: ['default'],
    inviteCode: null,
    buyShield: async () => ({}),
    buyBackground: async () => ({}),
    freezeEndsAt: null,
    refreshProfile: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const [isOnline] = useState(isSupabaseConfigured());
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [familyStatus, setFamilyStatus] = useState<'active' | 'locked'>('active');
    const [freezeEndsAt, setFreezeEndsAt] = useState<string | null>(null);

    const [coins, setCoins] = useState(0);
    const [streakShields, setStreakShields] = useState(0);
    const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>(['default']);
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    // persist family_id for device-level login
    const persistFamily = (familyId: string) => {
        localStorage.setItem('cached_family_id', familyId);
    };

    const refreshMembers = async (familyId: string) => {
        const { data } = await supabase
            .from('family_members')
            .select('*')
            .eq('family_id', familyId);

        // Manual sort to avoid type errors with order() on some supabase versions/types
        const members = ((data as any[]) || []).sort((a, b) => {
            if (a.role === b.role) return 0;
            return a.role === 'parent' ? -1 : 1;
        });

        if (members) {
            setFamilyMembers(members);
        }
    };

    const refreshFamily = async (userId: string) => {
        // Buscar a qué familia pertenezco
        const { data: myMember } = await supabase
            .from('family_members')
            .select('family_id')
            .eq('auth_user_id', userId)
            .single() as any;

        if (myMember) {
            persistFamily(myMember.family_id);
            // 1. Cargar Status de Familia
            const { data: family } = await supabase.from('families').select('invite_code, status, freeze_ends_at').eq('id', myMember.family_id).single() as any;
            if (family) {
                setFamilyStatus(family.status as 'active' | 'locked');
                setFreezeEndsAt(family.freeze_ends_at);
                setInviteCode(family.invite_code);
                // Check if freeze is expired
                if (family.status === 'locked' && family.freeze_ends_at && new Date(family.freeze_ends_at) < new Date()) {
                    // Auto-unlock locally, usually server would do this but client-side check helps
                    setFamilyStatus('active');
                }
            }

            // 2. Cargar miembros
            await refreshMembers(myMember.family_id);

            // Realtime Members Subscription
            const channelMembers = supabase
                .channel('family-members-changes')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'family_members', filter: `family_id=eq.${myMember.family_id}` },
                    () => {
                        refreshMembers(myMember.family_id);
                    }
                )
                .subscribe();

            // Realtime Family Status Subscription (bloqueo familiar)
            const channelFamily = supabase
                .channel('family-status-changes')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'families', filter: `id=eq.${myMember.family_id}` },
                    (payload) => {
                        const newStatus = payload.new.status;
                        if (newStatus) setFamilyStatus(newStatus);
                        if (payload.new.freeze_ends_at !== undefined) setFreezeEndsAt(payload.new.freeze_ends_at);
                    }
                )
                .subscribe();

            // Realtime Profile Subscription (Coins, Shields)
            const channelProfile = supabase
                .channel('my-profile-changes')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
                    (payload) => {
                        if (payload.new) {
                            setCoins(payload.new.coins);
                            setStreakShields(payload.new.streak_shields);
                        }
                    }
                )
                .subscribe();
        }

        // Cargar perfil extendido (monedas, escudos) -> Puede fallar si es un child sin auth user
        const { data: profile, error: profileLoadingError } = await supabase
            .from('profiles')
            .select('coins, streak_shields')
            .eq('id', userId)
            .maybeSingle() as any; // Use maybeSingle instead of single to avoid 406 on 0 rows

        if (profile) {
            setCoins(profile.coins || 0);
            setStreakShields(profile.streak_shields || 0);
        } else {
            console.log("No profile found for user, defaulting to 0", profileLoadingError);
            setCoins(0);
            setStreakShields(0);
        }

        // Cargar fondos comprados
        const { data: bgs } = await supabase
            .from('owned_backgrounds')
            .select('background_name')
            .eq('user_id', userId) as any;

        if (bgs) {
            setOwnedBackgrounds(['default', ...bgs.map((b: any) => b.background_name)]);
        }
    };

    useEffect(() => {
        const init = async () => {
            let currentSession = null;
            if (isOnline) {
                const { data: { session } } = await supabase.auth.getSession();
                currentSession = session;
                if (session?.user) {
                    setUser(session.user);
                    setRole('parent');
                    await refreshFamily(session.user.id);
                }
            }

            // If no user/session, try to load cached family for "Device Mode" (Child Login)
            if (!currentSession?.user) {
                const cachedFamilyId = localStorage.getItem('cached_family_id');
                if (cachedFamilyId) {
                    await refreshMembers(cachedFamilyId);
                }
            }

            setLoading(false);
        };
        init();
    }, [isOnline]);


    const signInAsParent = async (email?: string, password?: string) => {
        if (!isOnline) {
            return { error: { message: "Sin conexión a internet" } };
        }

        if (!email || !password) return { error: { message: "Faltan credenciales" } };

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (data.user) {
            // CRITICAL FIX: Ensure parent profile exists in public.profiles
            // This prevents FK errors when sending cheers or creating tasks
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                role: 'parent',
                display_name: data.user.email?.split('@')[0] || 'Padre',
                coins: 0, // Default if new
                streak_shields: 0
            }, { onConflict: 'id' });

            if (profileError) {
                console.error("Error creating parent profile:", profileError);
            }

            setUser(data.user);
            setRole('parent');
            await refreshFamily(data.user.id);
        }

        return { data, error };
    };

    const signInAsChild = async (memberId: string, pin: string) => {
        if (!isOnline) return false;

        // Buscar el miembro en la lista cargada
        const member = familyMembers.find(m => m.id === memberId);

        if (member) {
            // Validar PIN real
            if (member.pin === pin) {
                try {
                    setUser({
                        id: member.id,
                        name: member.name,
                        family_id: member.family_id,
                        role: 'child',
                        pin: pin // Store PIN for RPC authorization
                    });
                    setRole('child');

                    // CRITICAL: Hydrate child session data (coins, etc.)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('coins, streak_shields')
                        .eq('id', member.id)
                        .single() as any;

                    if (profile) {
                        setCoins(profile.coins || 0);
                        setStreakShields(profile.streak_shields || 0);
                    } else {
                        setCoins(0);
                        setStreakShields(0);
                    }

                    const { data: bgs } = await supabase
                        .from('owned_backgrounds')
                        .select('background_name')
                        .eq('user_id', member.id) as any;

                    if (bgs) {
                        setOwnedBackgrounds(['default', ...bgs.map((b: any) => b.background_name)]);
                    }

                    // Real-time subscription for child's profile (coins, shields)
                    const channelChildProfile = supabase
                        .channel('child-profile-changes')
                        .on(
                            'postgres_changes',
                            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${member.id}` },
                            (payload) => {
                                if (payload.new) {
                                    setCoins(payload.new.coins);
                                    setStreakShields(payload.new.streak_shields);
                                }
                            }
                        )
                        .subscribe();

                    return true;
                } catch (err) {
                    console.error("Error hydrating child session:", err);
                    return true;
                }
            }
        }

        return false;
    };

    const signUp = async (email: string, password: string) => {
        if (!isOnline) {
            alert("No se puede registrar en modo offline/mock.");
            return { error: { message: "Modo Offline" } };
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (data.user) {
            // Check if profile exists, if not create one
            const { error: profileError } = await supabase.from('profiles').insert([
                { id: data.user.id, role: 'parent', display_name: email.split('@')[0], family_id: null } // family_id nulo hasta crear familia
            ]);

            if (!profileError) {
                setUser(data.user);
                setRole('parent');
            }
        }
        return { data, error };
    };

    const joinFamily = async (inviteCode: string) => {
        if (!user) return { error: { message: "Debes iniciar sesión primero" } };

        // 1. Buscar familia por código
        const { data: family, error: familyError } = await supabase
            .from('families')
            .select('id')
            .eq('invite_code', inviteCode.toUpperCase()) // Asumimos mayúsculas
            .single() as any;

        if (familyError || !family) return { error: { message: "Código inválido o no encontrado" } };

        // 2. Verificar si ya soy miembro
        const { data: existing } = await supabase
            .from('family_members')
            .select('id')
            .eq('family_id', family.id)
            .eq('auth_user_id', user.id)
            .single() as any;

        if (existing) return { error: { message: "Ya eres miembro de esta familia" } };

        // 3. Crear miembro
        const { data, error } = await supabase.from('family_members').insert([{
            family_id: family.id,
            auth_user_id: user.id,
            role: 'parent', // Al unirse por código, se asume rol de padre/tutor
            name: user.email?.split('@')[0] || 'Nuevo Miembro'
        }]);

        if (!error) await refreshFamily(user.id);

        return { data, error };
    };

    const addChild = async (name: string, pin: string) => {
        if (!user) return { error: { message: "No estás autenticado" } };

        // Ensure family exists
        let familyId;
        if (!familyMembers.length) {
            // Auto-create family if strictly needed, or fail with specfic error
            // Better: Auto-create now to unblock the user
            const { data: newFamily, error: familyError } = await supabase.from('families').insert([{
                name: 'Familia ' + (user.email?.split('@')[0] || 'Nueva'),
                invite_code: Math.random().toString(36).substring(7).toUpperCase()
            }]).select().single() as any;

            if (familyError || !newFamily) return { error: { message: "Error creando familia: " + familyError?.message } };

            // Link parent
            await supabase.from('family_members').insert([{
                family_id: newFamily.id,
                auth_user_id: user.id,
                role: 'parent',
                name: user.email?.split('@')[0] || 'Padre UI'
            }]);

            familyId = newFamily.id;
        } else {
            familyId = familyMembers[0].family_id;
        }

        // 1. Crear miembro (Try with PIN first)
        const childData = {
            family_id: familyId,
            auth_user_id: null,
            role: 'child',
            name: name,
            pin: pin
        };

        const { data, error } = await supabase.from('family_members').insert([childData]).select().single() as any;

        if (error) {
            // Fallback: If error is about 'pin' column missing, try again without pin
            if (error.message?.includes('column "pin" of relation "family_members" does not exist')) {
                const { data: retryData, error: retryError } = await supabase.from('family_members').insert([{
                    ...childData,
                    pin: undefined // Omit pin
                }]).select().single() as any;

                if (!retryError && retryData) {
                    // Create Profile for Child
                    await supabase.from('profiles').insert([{
                        id: retryData.id,
                        role: 'child',
                        display_name: retryData.name,
                        coins: 0,
                        streak_shields: 0
                    } as any]);

                    await refreshFamily(user.id);
                    return { data: retryData, error: null };
                }
                return { data, error: retryError };
            }
        }

        // 2. Refresh & Create Profile
        if (!error && data) {
            // Create Profile for Child
            await supabase.from('profiles').insert([{
                id: data.id,
                role: 'child',
                display_name: data.name,
                coins: 0,
                streak_shields: 0
            } as any]);

            await refreshFamily(user.id);
        }

        return { data, error };
    };

    const toggleFamilyStatus = async (status: 'active' | 'locked') => {
        if (!user || !familyMembers.length) return;
        const familyId = familyMembers[0].family_id;

        await supabase
            .from('families')
            .update({ status })
            .eq('id', familyId);

        // Optimistic update
        setFamilyStatus(status);
    };

    const toggleFreeze = async (memberId: string, isFrozen: boolean) => {
        await supabase
            .from('family_members')
            .update({ is_frozen: isFrozen })
            .eq('id', memberId);

        // Optimistic
        setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, is_frozen: isFrozen } : m));
    };

    const initializeFamily = async () => {
        if (!user) return { error: { message: "No autenticado" } };

        // 1. Create Family
        // We use Math.random for MVP code. In production use a more robust generator or DB default.
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: newFamily, error: familyError } = await supabase.from('families').insert([{
            name: 'Familia ' + (user.email?.split('@')[0] || 'Nueva'),
            invite_code: inviteCode
        }]).select().single() as any;

        if (familyError) return { error: { message: "Error creando familia: " + familyError.message } };

        // 2. Link Parent
        const { error: memberError } = await supabase.from('family_members').insert([{
            family_id: newFamily.id,
            auth_user_id: user.id,
            role: 'parent',
            name: user.email?.split('@')[0] || 'Padre'
        }]);

        if (memberError) return { error: { message: "Error uniendo miembro: " + memberError.message } };

        setInviteCode(inviteCode);
        await refreshFamily(user.id);
        return { data: newFamily };
    };

    const signOut = async () => {
        setUser(null);
        setRole(null);
        setFamilyStatus('active');
        setCoins(0);
        setStreakShields(0);
        setOwnedBackgrounds(['default']);
        setInviteCode(null);
        localStorage.removeItem('mock_role');
        localStorage.removeItem('demo_mode');
        if (isOnline) await supabase.auth.signOut();
    };

    const buyShield = async () => {
        if (!user) return { error: { message: "No autenticado" } };
        if (coins < 150) return { error: { message: "Monedas insuficientes" } };
        if (streakShields >= 2) return { error: { message: "Capacidad de escudos llena (Máx 2)" } };

        // Check last purchase time (Client side optimization, should be DB enforcement too)
        const { data: profile } = await supabase
            .from('profiles')
            .select('last_shield_purchase')
            .eq('id', user.id)
            .single() as any;

        if (profile?.last_shield_purchase) {
            const lastBuy = new Date(profile.last_shield_purchase);
            const now = new Date();
            const hoursDiff = (now.getTime() - lastBuy.getTime()) / (1000 * 60 * 60);
            if (hoursDiff < 24) return { error: { message: "Solo puedes comprar 1 escudo cada 24h" } };
        }

        const newCoins = coins - 150;
        const newShields = streakShields + 1;

        const { error } = await supabase
            .from('profiles')
            .update({
                coins: newCoins,
                streak_shields: newShields,
                last_shield_purchase: new Date().toISOString()
            })
            .eq('id', user.id);

        if (!error) {
            setCoins(newCoins);
            setStreakShields(newShields);
            return { data: { success: true } };
        }
        return { error };
    };

    const buyBackground = async (bgName: string, price: number) => {
        if (!user) return { error: { message: "No autenticado" } };
        if (coins < price) return { error: { message: "Monedas insuficientes" } };
        if (ownedBackgrounds.includes(bgName)) return { error: { message: "Ya tienes este fondo" } };

        const newCoins = coins - price;

        // Transaction simulation: 1. Update Coins
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ coins: newCoins })
            .eq('id', user.id);

        if (profileError) return { error: profileError };

        // 2. Add Background
        const { error: bgError } = await supabase
            .from('owned_backgrounds')
            .insert([{
                user_id: user.id,
                background_name: bgName,
                is_active: false
            }]);

        if (!bgError) {
            setCoins(newCoins);
            setOwnedBackgrounds(prev => [...prev, bgName]);
            return { data: { success: true } };
        } else {
            // Rollback coins (basic)
            await supabase.from('profiles').update({ coins: coins }).eq('id', user.id);
            return { error: bgError };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            role,
            loading,
            signInAsParent,
            signInAsChild,
            signOut,
            signUp,
            addChild,
            joinFamily,
            initializeFamily,
            toggleFamilyStatus,
            toggleFreeze,
            familyMembers,
            familyStatus,
            isOnline,
            coins,
            streakShields,
            ownedBackgrounds,
            inviteCode,
            buyBackground,
            freezeEndsAt,
            refreshProfile: async () => {
                if (!user) return;
                const { data } = await supabase.from('profiles').select('coins, streak_shields').eq('id', user.id).single();
                if (data) {
                    setCoins(data.coins);
                    setStreakShields(data.streak_shields);
                }
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};
