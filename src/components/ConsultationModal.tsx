import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { getTodayString } from '../utils/dateUtils';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading?: boolean;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    data_consulta: getTodayString(),
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        data_consulta: initialData.data_consulta || getTodayString(),
        peso: initialData.peso?.toString() || '',
        cintura: initialData.cintura?.toString() || '',
        quadril: initialData.quadril?.toString() || '',
        percentual_gordura: initialData.percentual_gordura?.toString() || '',
        observacoes: initialData.observacoes || '',
        proximo_retorno: initialData.proximo_retorno || '',
      });
    } else {
      setFormData({
        data_consulta: getTodayString(),
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: '',
      });
    }
  }, [initialData, isOpen]);

  const parseNumber = (val: string): number | null => {
    if (!val) return null;
    const sanitized = val.toString().replace(',', '.').trim();
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? null : parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pesoValue = parseNumber(formData.peso);
    if (pesoValue === null) {
      alert('Por favor, insira um peso válido.');
      return;
    }

    const payload = {
      ...formData,
      peso: pesoValue,
      cintura: parseNumber(formData.cintura),
      quadril: parseNumber(formData.quadril),
      percentual_gordura: parseNumber(formData.percentual_gordura),
      proximo_retorno: formData.proximo_retorno || null,
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{initialData ? 'Editar Consulta' : 'Nova Consulta'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Data da Consulta *</label>
              <input 
                type="date" 
                name="data_consulta" 
                value={formData.data_consulta} 
                onChange={handleInputChange} 
                className="input-field" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Peso (kg) *</label>
              <input 
                type="text" 
                name="peso" 
                value={formData.peso} 
                onChange={handleInputChange} 
                className="input-field" 
                placeholder="Ex: 70,5"
                required 
              />
            </div>
            <div className="form-group">
              <label>Cintura (cm)</label>
              <input 
                type="text" 
                name="cintura" 
                value={formData.cintura} 
                onChange={handleInputChange} 
                className="input-field" 
                placeholder="Ex: 80,0"
              />
            </div>
            <div className="form-group">
              <label>Quadril (cm)</label>
              <input 
                type="text" 
                name="quadril" 
                value={formData.quadril} 
                onChange={handleInputChange} 
                className="input-field" 
                placeholder="Ex: 100,5"
              />
            </div>
            <div className="form-group">
              <label>% de Gordura</label>
              <input 
                type="text" 
                name="percentual_gordura" 
                value={formData.percentual_gordura} 
                onChange={handleInputChange} 
                className="input-field" 
                placeholder="Ex: 22,5"
              />
            </div>
            <div className="form-group">
              <label>Próximo Retorno</label>
              <input 
                type="date" 
                name="proximo_retorno" 
                value={formData.proximo_retorno} 
                onChange={handleInputChange} 
                className="input-field" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Observações Gerais</label>
            <textarea 
              name="observacoes" 
              value={formData.observacoes} 
              onChange={handleInputChange} 
              className="input-field" 
              rows={4}
              placeholder="Descreva observações importantes desta consulta..."
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto' }}>
              <Save size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Salvando...' : 'Salvar Consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;
