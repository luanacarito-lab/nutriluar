import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PremiumLayout from './components/PremiumLayout';
import PremiumLoading from './components/PremiumLoading';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import Agenda from './pages/Agenda';
import PatientProfile from './pages/PatientProfile';

// Rota que redireciona para o dashboard se o usuário já estiver logado
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PremiumLoading />;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

// Rota que redireciona para o login se o usuário NÃO estiver logado
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PremiumLoading />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PremiumLayout>
        <Router>
          <Routes>
            {/* Rotas Públicas / Visitantes */}
            <Route 
              path="/login" 
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } 
            />

            {/* Rotas Protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes" 
              element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/:id" 
              element={
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/novo" 
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pacientes/editar/:id" 
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agenda" 
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              } 
            />

            {/* Redirecionamento padrão */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </PremiumLayout>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
