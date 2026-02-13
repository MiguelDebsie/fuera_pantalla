import { AlertTriangle } from 'lucide-react';

export const DisconnectAlert = () => (
    <div className="fixed inset-0 bg-red-600 z-50 flex flex-col items-center justify-center text-white p-8 text-center animate-pulse">
        <AlertTriangle className="w-32 h-32 mb-6" />
        <h1 className="text-4xl font-black mb-4 uppercase tracking-widest">Tiempo de Calidad</h1>
        <p className="text-xl max-w-lg">
            Tus padres han activado una desconexión familiar.
            <br /><br />
            ¡Deja el dispositivo y ve a pasar tiempo con ellos!
        </p>
    </div>
);
