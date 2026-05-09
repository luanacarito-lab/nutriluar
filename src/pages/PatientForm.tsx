import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import PatientDataForm from '../components/PatientDataForm';

const PatientForm: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setInitialData(data);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do paciente.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

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
        nutricionista_id: user?.id,
        peso_inicial: parseValue(formData.peso_inicial),
        altura: altura,
        refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
        litros_agua: parseValue(formData.litros_agua),
      };

      const { data, error: submitError } = await supabase
        .from('pacientes')
        .upsert(id ? { ...payload, id } : payload)
        .select()
        .single();

      if (submitError) throw submitError;

      alert(id ? 'Paciente atualizado!' : 'Paciente cadastrado com sucesso!');
      navigate(`/pacientes/${data.id}`); // Redireciona para o perfil agora
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar paciente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="dashboard-container"><Sidebar /><main className="main-content">Carregando...</main></div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>{id ? 'Editar Paciente' : 'Novo Paciente'}</h1>
            <p>{id ? 'Atualize as informações do paciente.' : 'Preencha os dados para iniciar o acompanhamento.'}</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/pacientes')}>
            Cancelar
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        <PatientDataForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          loading={loading}
          onCancel={() => navigate('/pacientes')}
        />
      </main>
    </div>
  );
};

export default PatientForm;
