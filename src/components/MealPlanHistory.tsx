import React from 'react';
import { Calendar, ChevronRight, ClipboardList } from 'lucide-react';
import { formatLocalDate } from '../utils/dateUtils';

interface MealPlanHistoryProps {
  plans: any[];
  onSelect: (plan: any) => void;
}

const MealPlanHistory: React.FC<MealPlanHistoryProps> = ({ plans, onSelect }) => {
  if (plans.length === 0) {
    return (
      <div className="empty-state-large">
        <ClipboardList size={64} color="#D8E3D2" />
        <h3>Nenhum plano alimentar gerado ainda</h3>
        <p>Comece criando um plano personalizado para este paciente clicando no botão acima.</p>
      </div>
    );
  }

  return (
    <div className="meal-plan-history fade-in">
      <h3 className="section-title" style={{ marginTop: '40px' }}>Histórico de Planos</h3>
      <div className="consultations-list">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className="consultation-card" 
            onClick={() => onSelect(plan)}
            style={{ cursor: 'pointer' }}
          >
            <div className="consultation-summary">
              <div className="consultation-info">
                <div className="consultation-date">
                  {formatLocalDate(plan.created_at)}
                </div>
                <div className="consultation-metrics-summary">
                  <span><ClipboardList size={14} /> {plan.conteudo.titulo || 'Plano Alimentar'}</span>
                </div>
              </div>
              <div className="consultation-actions">
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginRight: '10px' }}>Ver detalhes</span>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanHistory;
