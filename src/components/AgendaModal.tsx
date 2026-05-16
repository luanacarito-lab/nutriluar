import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose, onSave, selectedDate, selectedTime }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    data: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    hora_inicio: selectedTime || '09:00',
    duracao: '60',
    titulo: '',
    observacoes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      setFormData(prev => ({ 
        ...prev, 
        data: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        hora_inicio: selectedTime || prev.hora_inicio
      }));
    }
  }, [isOpen, selectedDate, selectedTime]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('nutricionista_id', user?.id)
        .order('nome');
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agenda')
        .insert({
          ...formData,
          nutricionista_id: user?.id,
          duracao: parseInt(formData.duracao)
        });
      
      if (error) throw error;
      
      onSave();
      onClose();
    } catch (err: any) {
      alert('Erro ao agendar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content premium-card fade-in" style={{ maxWidth: '500px' }}>
        <header className="modal-header">
          <h2>📅 Agendar Consulta</h2>
          <button onClick={onClose} className="btn-close"><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label><User size={16} /> Paciente</label>
            <select 
              value={formData.paciente_id} 
              onChange={e => setFormData({...formData, paciente_id: e.target.value})}
              required
            >
              <option value="">Selecione um paciente</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Calendar size={16} /> Data</label>
              <input 
                type="date" 
                value={formData.data} 
                onChange={e => setFormData({...formData, data: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label><Clock size={16} /> Hora</label>
              <input 
                type="time" 
                value={formData.hora_inicio} 
                onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Duração (minutos)</label>
            <select 
              value={formData.duracao} 
              onChange={e => setFormData({...formData, duracao: e.target.value})}
            >
              <option value="30">30 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
            </select>
          </div>

          <div className="form-group">
            <label><MessageSquare size={16} /> Observações</label>
            <textarea 
              value={formData.observacoes} 
              onChange={e => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Ex: Primeira consulta, foco em hipertrofia..."
              rows={3}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendaModal;
