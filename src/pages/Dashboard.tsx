import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PatientListCard from '../components/PatientListCard';
import { formatLocalDate, getTodayString } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    consultationsThisWeek: 0,
    patientsWithoutReturn: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Perfil da nutricionista
      const { data: profileData } = await supabase
        .from('nutricionistas')
        .select('*')
        .eq('id', user?.id)
        .single();
      setProfile(profileData);

      // 2. Total de pacientes
      const { count: patientsCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user?.id);

      // 3. Consultas da semana (segunda a domingo)
      const today = new Date();
      const currentDay = today.getDay(); // 0 (Dom) a 6 (Sab)
      
      // Calcular segunda-feira da semana atual
      const monday = new Date(today);
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(today.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      
      // Calcular domingo da semana atual
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const formatDateForQuery = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const { count: consultationsCount } = await supabase
        .from('consultas')
        .select('id, pacientes!inner(nutricionista_id)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user?.id)
        .gte('data_consulta', formatDateForQuery(monday))
        .lte('data_consulta', formatDateForQuery(sunday));

      // 4. Pacientes sem retorno
      // Buscamos pacientes e suas consultas
      const { data: patientsWithConsultations } = await supabase
        .from('pacientes')
        .select('id, nome, consultas(data_consulta, proximo_retorno)')
        .eq('nutricionista_id', user?.id);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const withoutReturn = (patientsWithConsultations || [])
        .map((p: any) => {
          // Ordenar consultas por data decrescente
          const sortedConsultations = (p.consultas || []).sort((a: any, b: any) => 
            new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
          );

          const lastConsultation = sortedConsultations[0];
          
          if (!lastConsultation) return null; // Nunca consultou? Talvez não conte como "sem retorno" no sentido de "há mais de 30 dias"

          const lastDate = new Date(lastConsultation.data_consulta);
          const hasFutureReturn = sortedConsultations.some((c: any) => 
            c.proximo_retorno && new Date(c.proximo_retorno + 'T00:00:00') >= new Date()
          );

          if (lastDate < thirtyDaysAgo && !hasFutureReturn) {
            return {
              id: p.id,
              nome: p.nome,
              ultima_consulta: lastConsultation.data_consulta
            };
          }
          return null;
        })
        .filter(Boolean);

      setStats({
        totalPatients: patientsCount || 0,
        consultationsThisWeek: consultationsCount || 0,
        patientsWithoutReturn: withoutReturn,
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <Sidebar />
      
      <main className="main-content">
        <header className="welcome-header">
          <h1>Olá, {profile?.nome?.split(' ')[0] || 'Nutricionista'}</h1>
          <p>Bem-vinda ao seu painel do NutriLuar. Aqui está o resumo de hoje.</p>
        </header>

        <div className="dashboard-grid">
          <StatCard 
            label="Pacientes Ativos" 
            value={stats.totalPatients} 
            loading={loading}
            description="Total de pacientes cadastrados"
            onClick={() => navigate('/pacientes')}
          />
          <StatCard 
            label="Consultas da Semana" 
            value={stats.consultationsThisWeek} 
            loading={loading}
            description="Agendadas para esta semana"
            onClick={() => navigate('/agenda')}
          />
          <PatientListCard 
            patients={stats.patientsWithoutReturn} 
            loading={loading} 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
