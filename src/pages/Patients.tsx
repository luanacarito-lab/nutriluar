import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Badge from '../components/Badge';
import { formatLocalDate } from '../utils/dateUtils';

const Patients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*, consultas(data_consulta)')
        .eq('nutricionista_id', user?.id);

      if (error) throw error;

      // Processar dados para pegar a última consulta e objetivos principais
      const processed = (data || []).map(p => {
        const sortedConsultations = [...(p.consultas || [])].sort((a: any, b: any) => 
          new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
        );
        const lastConsultation = sortedConsultations[0];

        return {
          ...p,
          ultima_consulta: lastConsultation?.data_consulta,
          objetivo_principal: (p.objetivos && p.objetivos.length > 0) ? p.objetivos[0] : 'Saúde Geral'
        };
      });

      setPatients(processed);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Header />
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Meus Pacientes</h1>
            <p>Gerencie e acompanhe a evolução de seus pacientes.</p>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}
            onClick={() => navigate('/pacientes/novo')}
          >
            <UserPlus size={18} />
            Novo Paciente
          </button>
        </header>

        <div className="search-container" style={{ marginBottom: '30px' }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="patients-card">
          {loading ? (
            <div className="empty-state">Carregando seus pacientes...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? `Nenhum paciente encontrado para "${searchTerm}"` : "Você ainda não tem pacientes cadastrados."}
            </div>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Objetivo Principal</th>
                  <th>Última Consulta</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nome}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.email || 'Sem email'}</div>
                    </td>
                    <td>
                      <Badge text={p.objetivo_principal} variant="accent" />
                    </td>
                    <td>
                      {p.ultima_consulta 
                        ? formatLocalDate(p.ultima_consulta) 
                        : 'Nenhuma registrada'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Patients;
