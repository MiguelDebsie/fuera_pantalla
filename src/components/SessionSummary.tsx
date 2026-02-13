import React, { useState } from 'react';
import { Trophy, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface SessionSummaryProps {
    durationMinutes: number;
    onClose: () => void;
}

export const SessionSummary = ({ durationMinutes, onClose }: SessionSummaryProps) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState(''); // For now just a placeholder for logic
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [subject, setSubject] = useState('');

    const handleSave = async () => {
        if (!user) return;
        setUploading(true);

        // 1. Insert session log (Technical)
        const { error: sessionError } = await supabase.from('focus_sessions').insert({
            user_id: user.id,
            duration: durationMinutes * 60,
            status: 'completed',
            distractions: 0 // We should ideally get this from props, but 0 for now as we don't pass it yet
        });

        if (sessionError) {
            console.error("Error saving session", sessionError);
        }

        // 2. Insert Study Log (Qualitative - Pride Log)
        const { error: logError } = await supabase.from('study_logs').insert({
            user_id: user.id,
            subject: subject || 'General',
            notes: notes,
            duration_minutes: durationMinutes,
            evidence_url: evidenceUrl || null
        });

        // 3. Add Coins Reward (e.g., 2 coins per minute)
        try {
            const coinReward = durationMinutes * 2;

            // Find PIN for authorization
            const { data: memberData } = await supabase.from('family_members').select('pin').eq('id', user.id).single();
            const userPin = memberData?.pin;

            const { error: rpcError } = await supabase.rpc('award_coins', {
                p_user_id: user.id,
                p_amount: coinReward,
                p_pin: userPin || null
            });

            if (rpcError) {
                console.error("Error awarding coins via RPC", rpcError);
            }
        } catch (e) {
            console.error("Error awarding coins", e);
        }

        if (logError) {
            alert("Error guardando bitácora: " + logError.message);
            setUploading(false);
        } else {
            setSaved(true);
            setTimeout(onClose, 2000);
        }
    };

    if (saved) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/90 backdrop-blur-md p-4 animate-in zoom-in-50">
                <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Guardado!</h2>
                    <p className="text-gray-500 mb-6">Tu esfuerzo ha sido registrado.</p>
                    <p className="font-bold text-yellow-500 text-lg">+ {durationMinutes * 2} Monedas</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-indigo-600 p-6 text-center text-white">
                    <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">¡Sesión Completada!</h2>
                    <p className="text-indigo-200">Has mantenido el enfoque por {durationMinutes} minutos.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Materia / Tema</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ej. Matemáticas, Lectura..."
                            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none mb-4"
                        />

                        <label className="block text-sm font-bold text-gray-700 mb-2">Bitácora de Orgullo</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="¿Qué aprendiste hoy? ¿Qué lograste?"
                            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none h-32 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Prueba de Trabajo (Foto)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={async (e) => {
                                    if (!e.target.files || e.target.files.length === 0) return;
                                    const file = e.target.files[0];

                                    try {
                                        setUploading(true);
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
                                        const filePath = `${fileName}`;

                                        const { error: uploadError } = await supabase.storage
                                            .from('evidence')
                                            .upload(filePath, file);

                                        if (uploadError) {
                                            throw uploadError;
                                        }

                                        const { data: { publicUrl } } = supabase.storage
                                            .from('evidence')
                                            .getPublicUrl(filePath);

                                        setEvidenceUrl(publicUrl);
                                        setUploading(false);
                                    } catch (error: any) {
                                        alert('Error subiendo foto: ' + error.message);
                                        setUploading(false);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${evidenceUrl ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                {evidenceUrl ? (
                                    <div className="relative h-32 w-full">
                                        <img src={evidenceUrl} alt="Evidencia" className="h-full w-full object-contain rounded-lg" />
                                        <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full shadow-sm">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-bold">Tocar para tomar foto</p>
                                        <p className="text-xs text-gray-400">Sube una foto de tu tarea terminada</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? "Subiendo..." : "RECLAMAR RECOMPENSA"}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
                    >
                        Saltar y perder monedas extra
                    </button>
                </div>
            </div>
        </div >
    );
};
