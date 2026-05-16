import React, { useState } from 'react';
import { Save, X, RotateCcw } from 'lucide-react';

interface MealPlanDisplayProps {
  plan: any;
  onSave: (updatedPlan: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan, onSave, onCancel, loading }) => {
  const [editedPlan, setEditedPlan] = useState(plan);

  const handleOptionChange = (dayIndex: number, mealKey: string, optionIndex: number, value: string) => {
    const newPlan = { ...editedPlan };
    newPlan.plano_semanal[dayIndex].refeicoes[mealKey][optionIndex] = value;
    setEditedPlan(newPlan);
  };

  const mealLabels: { [key: string]: string } = {
    cafe_da_manha: '☀️ Café da Manhã',
    lanche_manha: '🍎 Lanche da Manhã',
    almoco: '🍽️ Almoço',
    lanche_tarde: '☕ Lanche da Tarde',
    jantar: '🌙 Jantar'
  };

  return (
    <div className="meal-plan-editor fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">{editedPlan.titulo}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            {editedPlan.observacao_professional}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            <X size={18} style={{ marginRight: '8px' }} />
            Descartar
          </button>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => onSave(editedPlan)} disabled={loading}>
            <Save size={18} style={{ marginRight: '8px' }} />
            {loading ? 'Salvando...' : 'Salvar Plano'}
          </button>
        </div>
      </div>

      <div className="meal-plan-grid">
        {editedPlan.plano_semanal?.map((dia: any, dayIdx: number) => (
          <div key={dia.dia} className="stat-card" style={{ padding: '25px', height: 'auto' }}>
            <h3 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px', marginBottom: '20px' }}>
              {dia.dia}
            </h3>
            
            {dia.refeicoes && ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'].map((mealKey) => (
              dia.refeicoes[mealKey] && (
                <div key={mealKey} className="meal-section" style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--color-accent)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {mealLabels[mealKey] || mealKey}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.isArray(dia.refeicoes[mealKey]) && dia.refeicoes[mealKey].map((opcao: string, optIdx: number) => (
                      <input 
                        key={optIdx}
                        type="text"
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                        value={opcao}
                        onChange={(e) => handleOptionChange(dayIdx, mealKey, optIdx, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ))}
      </div>

      <div className="form-actions" style={{ marginTop: '40px' }}>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => onSave(editedPlan)} disabled={loading}>
          <Save size={18} style={{ marginRight: '8px' }} />
          {loading ? 'Confirmar e Salvar Plano Alimentar' : 'Confirmar e Salvar Plano Alimentar'}
        </button>
      </div>
    </div>
  );
};

export default MealPlanDisplay;
