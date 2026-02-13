import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildDashboard } from './components/ChildDashboard';
import { DisconnectAlert } from './components/DisconnectAlert';

function App() {
    const { user, role, loading, familyStatus } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Cargando Familia...</div>;
    }

    if (familyStatus === 'locked' && role === 'child') {
        return <DisconnectAlert />;
    }

    if (!user) {
        return <Login />;
    }

    if (role === 'parent') {
        return <ParentDashboard />;
    }

    return <ChildDashboard />;
}

export default App;
