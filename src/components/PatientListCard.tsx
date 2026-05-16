import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatLocalDate } from '../utils/dateUtils';

interface Patient {
  id: string;
  nome: string;
  ultima_consulta?: string;
}

interface PatientListCardProps {
  patients: Patient[];
  loading?: boolean;
}

const PatientListCard: React.FC<PatientListCardProps> = ({ patients, loading }) => {
  return (
    <div className="stat-card patient-list-container">
      <span className="stat-label">Pacientes sem retorno</span>
      
      {loading ? (
        <div className="empty-state">Carregando pacientes...</div>
      ) : patients.length === 0 ? (
        <div className="empty-state">Tudo em dia! Nenhum paciente sem retorno.</div>
      ) : (
        <ul className="patient-list">
          {patients.map((patient) => (
            <li key={patient.id} className="patient-item">
              <Link to={`/pacientes/${patient.id}`} className="patient-link">
                <span>{patient.nome}</span>
                {patient.ultima_consulta && (
                  <span className="patient-date">
                    Última consulta: {formatLocalDate(patient.ultima_consulta)}
                  </span>
                )}
              </Link>
              <ChevronRight size={18} color="var(--color-border)" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientListCard;
