// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage  from './pages/LoginPage';
import VoterPage  from './pages/VoterPage';
import AdminPage  from './pages/AdminPage';
import Toast      from './components/Toast';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/vote" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/vote'} replace /> : <LoginPage />
      } />
      <Route path="/vote" element={
        <PrivateRoute><VoterPage /></PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute adminOnly><AdminPage /></PrivateRoute>
      } />
      <Route path="*" element={
        <Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/vote') : '/login'} replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toast />
      <AppRoutes />
    </AuthProvider>
  );
}
