import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, User, Activity, Clock } from 'lucide-react';

interface PatientDataFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const PatientDataForm: React.FC<PatientDataFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [] as string[],
    restricoes_alimentares: [] as string[],
    alergias: [] as string[],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        peso_inicial: initialData.peso_inicial?.toString() || '',
        altura: initialData.altura?.toString() || '',
        refeicoes_por_dia: initialData.refeicoes_por_dia?.toString() || '',
        litros_agua: initialData.litros_agua?.toString() || '',
        objetivos: initialData.objetivos || [],
        patologias: initialData.patologias || [],
        restricoes_alimentares: initialData.restricoes_alimentares || [],
        alergias: initialData.alergias || [],
      });
    }
  }, [initialData]);

  const age = useMemo(() => {
    if (!formData.data_nascimento) return null;
    const birthDate = new Date(formData.data_nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [formData.data_nascimento]);

  const parseNumber = (val: string): number => {
    if (!val) return 0;
    // Substituir vírgula por ponto e remover espaços
    const sanitized = val.toString().replace(',', '.').trim();
    return parseFloat(sanitized) || 0;
  };

  const imc = useMemo(() => {
    const weight = parseNumber(formData.peso_inicial);
    let height = parseNumber(formData.altura);

    if (weight > 0 && height > 0) {
      // Se altura > 3, consideramos que está em centímetros
      if (height > 3) {
        height = height / 100;
      }
      
      const calc = weight / (height * height);
      return calc.toFixed(1);
    }
    return null;
  }, [formData.peso_inicial, formData.altura]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = (prev as any)[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="tabs-container">
        <button type="button" className={`tab-button ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
          <User size={18} style={{ marginRight: '8px' }} />
          Pessoal
        </button>
        <button type="button" className={`tab-button ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
          <Activity size={18} style={{ marginRight: '8px' }} />
          Clínico
        </button>
        <button type="button" className={`tab-button ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
          <Clock size={18} style={{ marginRight: '8px' }} />
          Hábitos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {/* ABA 1: PESSOAL */}
        {activeTab === 0 && (
          <div className="auth-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} className="input-field" required />
              </div>
              <div className="form-group">
                <label>Data de Nascimento {age !== null && <span className="read-only-info">{age} anos</span>}</label>
                <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="form-group">
                <label>Sexo</label>
                <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="input-field">
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handleInputChange} className="input-field" placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="input-field" placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 1 && (
          <div className="auth-card">
            <h3 className="form-section-title">Dados Corporais</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Peso Inicial (kg)</label>
                <input type="text" name="peso_inicial" value={formData.peso_inicial} onChange={handleInputChange} className="input-field" placeholder="Ex: 70,5" />
              </div>
              <div className="form-group">
                <label>Altura (cm)</label>
                <input type="text" name="altura" value={formData.altura} onChange={handleInputChange} className="input-field" placeholder="Ex: 1,70 ou 170" />
              </div>
              <div className="form-group">
                <label>IMC {imc && <span className="read-only-info">{imc}</span>}</label>
                <input type="text" value={imc || ''} readOnly className="input-field" style={{ backgroundColor: '#f0f0f0' }} />
              </div>
            </div>

            <h3 className="form-section-title">Objetivos</h3>
            <div className="checkbox-group">
              {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                <div key={obj} className={`checkbox-item ${formData.objetivos.includes(obj) ? 'active' : ''}`} onClick={() => handleMultiSelect('objetivos', obj)}>
                  {obj}
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Descrição adicional do objetivo</label>
              <textarea name="objetivo_texto" value={formData.objetivo_texto} onChange={handleInputChange} className="input-field" rows={3}></textarea>
            </div>

            <h3 className="form-section-title">Saúde e Histórico</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nível de Atividade Física</label>
                <select name="nivel_atividade" value={formData.nivel_atividade} onChange={handleInputChange} className="input-field">
                  <option value="">Selecione...</option>
                  <option value="Sedentário">Sedentário</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Intenso">Intenso</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Patologias / Condições</label>
              <textarea name="medicamentos" value={formData.medicamentos} onChange={handleInputChange} className="input-field" placeholder="Medicamentos em uso" rows={2}></textarea>
              <textarea name="suplementos" value={formData.suplementos} onChange={handleInputChange} className="input-field" placeholder="Suplementos em uso" rows={2} style={{ marginTop: '10px' }}></textarea>
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 2 && (
          <div className="auth-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Refeições por dia</label>
                <input type="number" name="refeicoes_por_dia" value={formData.refeicoes_por_dia} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="form-group">
                <label>Água por dia (litros)</label>
                <input type="number" step="0.1" name="litros_agua" value={formData.litros_agua} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="form-group">
                <label>Horário que acorda</label>
                <input type="time" name="horario_acorda" value={formData.horario_acorda} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="form-group">
                <label>Horário que dorme</label>
                <input type="time" name="horario_dorme" value={formData.horario_dorme} onChange={handleInputChange} className="input-field" />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name="atividade_fisica" checked={formData.atividade_fisica} onChange={handleInputChange} />
                Pratica atividade física regularmente?
              </label>
              {formData.atividade_fisica && (
                <textarea name="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleInputChange} className="input-field" placeholder="Quais e com qual frequência?" rows={2} style={{ marginTop: '10px' }}></textarea>
              )}
            </div>

            <div className="form-group">
              <label>Observações Gerais</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} className="input-field" rows={4}></textarea>
            </div>
          </div>
        )}

        <div className="form-actions">
          <div>
            {activeTab > 0 && (
              <button type="button" className="btn-secondary" onClick={() => setActiveTab(activeTab - 1)}>
                <ChevronLeft size={18} style={{ marginRight: '8px' }} />
                Voltar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            {onCancel && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
            )}
            {activeTab < 2 ? (
              <button type="button" className="btn-primary" style={{ width: 'auto' }} onClick={() => setActiveTab(activeTab + 1)}>
                Próximo
                <ChevronRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            ) : (
              <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={loading}>
                <Save size={18} style={{ marginRight: '8px' }} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientDataForm;
