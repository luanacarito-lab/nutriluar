import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Activity, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Edit2, 
  ClipboardList,
  ChevronLeft,
  Scale,
  Target,
  Ruler,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import PatientDataForm from '../components/PatientDataForm';
import EvolutionChart from '../components/EvolutionChart';
import ConsultationModal from '../components/ConsultationModal';
import MealPlanDisplay from '../components/MealPlanDisplay';
import MealPlanHistory from '../components/MealPlanHistory';
import PremiumLoading from '../components/PremiumLoading';
import { formatLocalDate, calculateAge } from '../utils/dateUtils';

const PatientProfile: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('consultas'); // 'dados', 'consultas', 'planos'
  const [patient, setPatient] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // AI Plan states
  const [plansHistory, setPlansHistory] = useState<any[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<any>(null);

  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });
      
      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData || []);

      // Fetch meal plans history
      const { data: plansData, error: plansError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });
      
      if (plansError) throw plansError;
      setPlansHistory(plansData || []);

    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (formData: any) => {
    setSaveLoading(true);
    try {
      const parseValue = (val: any) => {
        if (!val) return null;
        const sanitized = val.toString().replace(',', '.').trim();
        return parseFloat(sanitized) || null;
      };

      let altura = parseValue(formData.altura);
      if (altura && altura > 3) {
        altura = altura / 100;
      }

      const payload = {
        ...formData,
        peso_inicial: parseValue(formData.peso_inicial),
        altura: altura,
        refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
        litros_agua: parseValue(formData.litros_agua),
      };

      const { error } = await supabase
        .from('pacientes')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      
      setPatient({ ...patient, ...payload });
      alert('Dados do paciente atualizados com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar paciente: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveConsultation = async (formData: any) => {
    if (!formData.peso) {
      alert('O peso é obrigatório.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        paciente_id: id,
        nutricionista_id: user?.id
      };

      if (editingConsultation) {
        const { error } = await supabase
          .from('consultas')
          .update(payload)
          .eq('id', editingConsultation.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('consultas')
          .insert(payload);
        
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingConsultation(null);
      fetchData(); // Refresh list and stats
      alert(editingConsultation ? 'Consulta atualizada!' : 'Nova consulta registrada!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar consulta: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGenerateAIPlan = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientData: {
            ...patient,
            idade: patient.data_nascimento ? calculateAge(patient.data_nascimento) : null
          }, 
          consultations 
        })
      });

      const text = await response.text();
      console.log("Resposta da API (raw):", text);

      if (!response.ok) {
        let errorMessage = 'Falha ao gerar plano com IA';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = JSON.parse(text);
      setGeneratedPlan(data);
      setViewingPlan(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao gerar plano: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAIPlan = async (finalPlan: any) => {
    setSaveLoading(true);
    try {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .insert({
          paciente_id: id,
          nutricionista_id: user?.id,
          conteudo: finalPlan
        })
        .select()
        .single();

      if (error) throw error;

      setPlansHistory([data, ...plansHistory]);
      setGeneratedPlan(null);
      setViewingPlan(data);
      alert('Plano alimentar salvo com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar plano: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(cid => cid !== cardId) 
        : [...prev, cardId]
    );
  };

  const stats = useMemo(() => {
    if (!patient) return {
      lastDate: '-',
      nextReturnDate: '-',
      currentWeight: null,
      initialWeight: null,
      weightDiff: null,
      chartData: []
    };

    const lastConsultation = consultations[0];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextReturn = consultations
      .filter(c => c.proximo_retorno && new Date(c.proximo_retorno + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.proximo_retorno).getTime() - new Date(b.proximo_retorno).getTime())[0];

    const chartData = consultations.map(c => ({
      date: c.data_consulta,
      weight: parseFloat(c.peso),
      cintura: c.cintura ? parseFloat(c.cintura) : null,
      quadril: c.quadril ? parseFloat(c.quadril) : null,
      percentual_gordura: c.percentual_gordura ? parseFloat(c.percentual_gordura) : null,
    }));

    const currentWeight = lastConsultation ? parseFloat(lastConsultation.peso) : null;
    const initialWeight = patient.peso_inicial ? parseFloat(patient.peso_inicial) : null;
    const weightDiff = (currentWeight !== null && initialWeight !== null) ? (currentWeight - initialWeight) : null;

    return {
      lastDate: lastConsultation ? formatLocalDate(lastConsultation.data_consulta) : '-',
      nextReturnDate: nextReturn ? formatLocalDate(nextReturn.proximo_retorno) : '-',
      currentWeight,
      initialWeight,
      weightDiff,
      chartData
    };
  }, [consultations, patient]);

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <PremiumLoading message="Carregando perfil do paciente..." />
      </main>
    </div>
  );
  if (error) return <div className="dashboard-container"><Sidebar /><main className="main-content"><div className="error-message">{error}</div></main></div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content premium-fade-in">
        <header className="page-header premium-profile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate('/pacientes')} className="btn-back">
              <ChevronLeft size={24} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ margin: 0 }}>{patient.nome}</h1>
                <span className="badge-premium-gold">
                  <Target size={14} style={{ marginRight: '6px' }} />
                  {patient.objetivo_principal || 'Paciente'}
                </span>
              </div>
              <p className="text-muted" style={{ marginTop: '5px' }}>
                ID: {id?.substring(0, 8)} • Cadastrado em {formatLocalDate(patient.created_at)}
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate(`/pacientes/editar/${id}`)}>
              <Edit2 size={18} style={{ marginRight: '8px' }} />
              Editar Perfil
            </button>
          </div>
        </header>

        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'dados' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dados')}
          >
            <User size={18} style={{ marginRight: '8px' }} />
            Dados do Paciente
          </button>
          <button 
            className={`tab-button ${activeTab === 'consultas' ? 'active' : ''}`} 
            onClick={() => setActiveTab('consultas')}
          >
            <Activity size={18} style={{ marginRight: '8px' }} />
            Consultas
          </button>
          <button 
            className={`tab-button ${activeTab === 'planos' ? 'active' : ''}`} 
            onClick={() => setActiveTab('planos')}
          >
            <ClipboardList size={18} style={{ marginRight: '8px' }} />
            Planos Alimentares
          </button>
        </div>

        {/* SEÇÃO 1: DADOS */}
        {activeTab === 'dados' && (
          <div className="fade-in">
            <PatientDataForm 
              initialData={patient} 
              onSubmit={handleUpdatePatient} 
              loading={saveLoading} 
            />
          </div>
        )}

        {/* SEÇÃO 2: CONSULTAS */}
        {activeTab === 'consultas' && (
          <div className="fade-in">
            {/* Resumo Visual */}
            <div className="profile-stats-grid">
              <div className="stat-card">
                <div className="stat-label">Peso Inicial</div>
                <div className="stat-value">{stats?.initialWeight ? `${stats.initialWeight}kg` : '-'}</div>
                <Scale size={20} className="stat-icon" />
              </div>
              <div className="stat-card">
                <div className="stat-label">Peso Atual</div>
                <div className="stat-value">{stats?.currentWeight ? `${stats.currentWeight}kg` : '-'}</div>
                <Scale size={20} className="stat-icon" />
              </div>
              <div className="stat-card">
                <div className="stat-label">Diferença</div>
                <div className={`stat-value ${stats?.weightDiff && stats.weightDiff < 0 ? 'text-success' : stats?.weightDiff && stats.weightDiff > 0 ? 'text-error' : ''}`}>
                  {stats?.weightDiff !== null ? `${stats.weightDiff > 0 ? '+' : ''}${stats.weightDiff.toFixed(1)}kg` : '-'}
                  {stats?.weightDiff !== null && stats.weightDiff < 0 && <TrendingDown size={20} style={{ marginLeft: '8px' }} />}
                  {stats?.weightDiff !== null && stats.weightDiff > 0 && <TrendingUp size={20} style={{ marginLeft: '8px' }} />}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Última Consulta</div>
                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats?.lastDate}</div>
                <Calendar size={20} className="stat-icon" />
              </div>
              <div className="stat-card">
                <div className="stat-label">Próximo Retorno</div>
                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stats?.nextReturnDate}</div>
                <Calendar size={20} className="stat-icon" />
              </div>
            </div>

            {/* Gráficos de Evolução */}
            <h2 className="section-title">Evolução do Paciente</h2>
            <div className="evolution-charts-grid">
              <div className="stat-card chart-card-main">
                <div className="stat-label">Evolução de Peso (kg)</div>
                <EvolutionChart 
                  data={stats?.chartData || []} 
                  dataKey="weight" 
                  name="Peso (kg)" 
                  color="#6B8F71"
                />
              </div>
              <div className="stat-card chart-card-secondary">
                <div className="stat-label">Evolução da Cintura (cm)</div>
                <EvolutionChart 
                  data={stats?.chartData || []} 
                  dataKey="cintura" 
                  name="Cintura (cm)" 
                  color="#A8C3A0"
                  height={200}
                />
              </div>
              <div className="stat-card chart-card-secondary">
                <div className="stat-label">Evolução do Quadril (cm)</div>
                <EvolutionChart 
                  data={stats?.chartData || []} 
                  dataKey="quadril" 
                  name="Quadril (cm)" 
                  color="#D8E3D2"
                  height={200}
                />
              </div>
              <div className="stat-card chart-card-secondary">
                <div className="stat-label">Percentual de Gordura (%)</div>
                <EvolutionChart 
                  data={stats?.chartData || []} 
                  dataKey="percentual_gordura" 
                  name="Gordura (%)" 
                  color="#6B8F71"
                  height={200}
                />
              </div>
            </div>

            {/* Lista de Consultas */}
            <div className="section-header" style={{ marginTop: '50px' }}>
              <h2 id="consultas-title">Consultas</h2>
              <button className="btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingConsultation(null); setIsModalOpen(true); }}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Nova Consulta
              </button>
            </div>

            <div className="consultations-list">
              {consultations.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma consulta registrada ainda.</p>
                </div>
              ) : (
                consultations.map((c) => (
                  <div key={c.id} className={`consultation-card ${expandedCards.includes(c.id) ? 'expanded' : ''}`}>
                    <div className="consultation-summary" onClick={() => toggleCard(c.id)}>
                      <div className="consultation-info">
                        <div className="consultation-date">
                          {formatLocalDate(c.data_consulta, { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="consultation-metrics-summary">
                          <span><Scale size={14} /> {c.peso} kg</span>
                          {c.cintura && <span><Ruler size={14} /> {c.cintura}cm</span>}
                          {c.percentual_gordura && <span><Target size={14} /> {c.percentual_gordura}%</span>}
                        </div>
                      </div>
                      <div className="consultation-actions">
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingConsultation(c); setIsModalOpen(true); }}>
                          <Edit2 size={16} />
                        </button>
                        {expandedCards.includes(c.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                    
                    {expandedCards.includes(c.id) && (
                      <div className="consultation-details">
                        <div className="details-grid">
                          <div className="detail-item">
                            <label>Peso</label>
                            <p>{c.peso} kg</p>
                          </div>
                          <div className="detail-item">
                            <label>Cintura</label>
                            <p>{c.cintura ? `${c.cintura} cm` : '-'}</p>
                          </div>
                          <div className="detail-item">
                            <label>Quadril</label>
                            <p>{c.quadril ? `${c.quadril} cm` : '-'}</p>
                          </div>
                          <div className="detail-item">
                            <label>% Gordura</label>
                            <p>{c.percentual_gordura ? `${c.percentual_gordura}%` : '-'}</p>
                          </div>
                        </div>
                        {c.observacoes && (
                          <div className="detail-item full">
                            <label>Observações</label>
                            <p>{c.observacoes}</p>
                          </div>
                        )}
                        {c.proximo_retorno && (
                          <div className="detail-item full">
                            <label>Retorno Agendado</label>
                            <p className="return-date">
                              <Calendar size={16} style={{ marginRight: '8px' }} />
                              {formatLocalDate(c.proximo_retorno)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO 3: PLANOS ALIMENTARES */}
        {activeTab === 'planos' && (
          <div className="fade-in">
             <div className="section-header">
              <h2>Planos Alimentares</h2>
              {!generatedPlan && !viewingPlan && (
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto' }} 
                  onClick={handleGenerateAIPlan}
                  disabled={aiLoading}
                >
                  <Plus size={18} style={{ marginRight: '8px' }} />
                  {aiLoading ? 'Gerando...' : 'Gerar Plano Alimentar com IA'}
                </button>
              )}
              {(generatedPlan || viewingPlan) && (
                <button 
                  className="btn-secondary" 
                  style={{ width: 'auto' }} 
                  onClick={() => { setGeneratedPlan(null); setViewingPlan(null); }}
                >
                  Voltar ao Histórico
                </button>
              )}
            </div>
            
            {aiLoading && (
              <div className="empty-state-large">
                <div className="loading-spinner" style={{ marginBottom: '20px' }}></div>
                <h3>Gerando plano alimentar personalizado...</h3>
                <p>Nossa IA está analisando os dados de {patient.nome.split(' ')[0]} para criar a melhor sugestão.</p>
              </div>
            )}

            {!aiLoading && generatedPlan && (
              <MealPlanDisplay 
                plan={generatedPlan} 
                onSave={handleSaveAIPlan} 
                onCancel={() => setGeneratedPlan(null)}
                loading={saveLoading}
              />
            )}

            {!aiLoading && !generatedPlan && viewingPlan && (
              <div className="viewing-saved-plan">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span className="badge badge-accent">Plano salvo em {formatLocalDate(viewingPlan.created_at)}</span>
                </div>
                <MealPlanDisplay 
                  plan={viewingPlan.conteudo} 
                  onSave={async () => { alert('Para editar um plano salvo, gere um novo ou implementaremos a edição em breve.'); }} 
                  onCancel={() => setViewingPlan(null)}
                  loading={false}
                />
              </div>
            )}

            {!aiLoading && !generatedPlan && !viewingPlan && (
              <MealPlanHistory 
                plans={plansHistory} 
                onSelect={(p) => setViewingPlan(p)} 
              />
            )}
          </div>
        )}

        <ConsultationModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveConsultation}
          initialData={editingConsultation}
          loading={saveLoading}
        />
      </main>
    </div>
  );
};

export default PatientProfile;
