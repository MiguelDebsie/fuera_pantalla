export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            families: {
                Row: {
                    id: string
                    name: string
                    invite_code: string
                    status: 'active' | 'locked'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    invite_code?: string
                    status?: 'active' | 'locked'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    invite_code?: string
                    status?: 'active' | 'locked'
                    created_at?: string
                }
            }
            family_members: {
                Row: {
                    id: string
                    family_id: string
                    auth_user_id: string | null
                    role: 'parent' | 'child'
                    name: string
                    pin: string
                    is_frozen: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    family_id: string
                    auth_user_id?: string | null
                    role: 'parent' | 'child'
                    name: string
                    pin?: string
                    is_frozen?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    family_id?: string
                    auth_user_id?: string | null
                    role?: 'parent' | 'child'
                    name?: string
                    pin?: string
                    is_frozen?: boolean
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    family_id: string | null
                    role: 'parent' | 'child'
                    display_name: string
                    avatar_url: string | null
                    pin_hash: string | null
                    created_at: string
                    coins: number
                    streak_shields: number
                    last_shield_purchase: string | null
                }
                Insert: {
                    id: string
                    family_id?: string | null
                    role: 'parent' | 'child'
                    display_name: string
                    avatar_url?: string | null
                    pin_hash?: string | null
                    created_at?: string
                    coins?: number
                    streak_shields?: number
                    last_shield_purchase?: string | null
                }
                Update: {
                    id?: string
                    family_id?: string | null
                    role?: 'parent' | 'child'
                    display_name?: string
                    avatar_url?: string | null
                    pin_hash?: string | null
                    created_at?: string
                    coins?: number
                    streak_shields?: number
                    last_shield_purchase?: string | null
                }
            }
            owned_backgrounds: {
                Row: {
                    id: string
                    user_id: string
                    background_name: string
                    is_active: boolean
                    purchased_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    background_name: string
                    is_active?: boolean
                    purchased_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    background_name?: string
                    is_active?: boolean
                    purchased_at?: string
                }
            }
            pets: {
                Row: {
                    id: string
                    owner_id: string
                    species: string
                    xp: number
                    level: number
                    status: 'active' | 'resting' | 'frozen' | 'sick'
                    config: Json
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    species: string
                    xp?: number
                    level?: number
                    status?: 'active' | 'resting' | 'frozen' | 'sick'
                    config?: Json
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    species?: string
                    xp?: number
                    level?: number
                    status?: 'active' | 'resting' | 'frozen' | 'sick'
                    config?: Json
                    updated_at?: string
                }
            }
            focus_sessions: {
                Row: {
                    id: string
                    user_id: string
                    start_at: string
                    end_at: string | null
                    duration: number
                    distractions: number
                    status: 'completed' | 'failed' | 'abandoned'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    start_at?: string
                    end_at?: string | null
                    duration: number
                    distractions?: number
                    status: 'completed' | 'failed' | 'abandoned'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    start_at?: string
                    end_at?: string | null
                    duration?: number
                    distractions?: number
                    status?: 'completed' | 'failed' | 'abandoned'
                    created_at?: string
                }
            }
        },
        tasks: {
            Row: {
                id: string
                family_id: string
                title: string
                description: string | null
                status: 'pending' | 'approved' | 'rejected'
                created_at: string
                completed_at: string | null
            }
            Insert: {
                id?: string
                family_id: string
                title: string
                description?: string | null
                status?: 'pending' | 'approved' | 'rejected'
                created_at?: string
                completed_at?: string | null
            }
            Update: {
                id?: string
                family_id?: string
                title?: string
                description?: string | null
                status?: 'pending' | 'approved' | 'rejected'
                created_at?: string
                completed_at?: string | null
            }
        },
        distractions: {
            Row: {
                id: string
                user_id: string
                detected_at: string
                duration_seconds: number
            }
            Insert: {
                id?: string
                user_id: string
                detected_at?: string
                duration_seconds?: number
            }
            Update: {
                id?: string
                user_id?: string
                detected_at?: string
                duration_seconds?: number
            }
        },
        user_presence: {
            Row: {
                user_id: string
                last_seen_at: string
                current_activity: string
                current_pet_mood: string
            }
            Insert: {
                user_id: string
                last_seen_at?: string
                current_activity?: string
                current_pet_mood?: string
            }
            Update: {
                user_id?: string
                last_seen_at?: string
                current_activity?: string
                current_pet_mood?: string
            }
        },
        family_cheers: {
            Row: {
                id: string
                family_id: string
                from_user_id: string
                to_user_id: string
                message: string
                created_at: string
            }
            Insert: {
                id?: string
                family_id: string
                from_user_id: string
                to_user_id: string
                message: string
                created_at?: string
            }
            Update: {
                id?: string
                family_id?: string
                from_user_id?: string
                to_user_id?: string
                message?: string
                created_at?: string
            }
        },
        study_logs: {
            Row: {
                id: string
                user_id: string
                subject: string
                notes: string | null
                duration_minutes: number
                evidence_url: string | null
                created_at: string
            }
            Insert: {
                id?: string
                user_id: string
                subject: string
                notes?: string | null
                duration_minutes: number
                evidence_url?: string | null
                created_at?: string
            }
            Update: {
                id?: string
                user_id?: string
                subject?: string
                notes?: string | null
                duration_minutes?: number
                evidence_url?: string | null
                created_at?: string
            }
        }
    }
}
}

