import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PremiumLoading from '../components/PremiumLoading';
import AgendaModal from '../components/AgendaModal';

const Agenda: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [returnPredictions, setReturnPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchReturnPredictions();
    fetchPatients();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select(`
          *,
          pacientes (nome)
        `)
        .eq('nutricionista_id', user.id);
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Erro ao buscar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnPredictions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          proximo_retorno,
          paciente_id,
          pacientes (nome)
        `)
        .eq('nutricionista_id', user.id)
        .not('proximo_retorno', 'is', null);
      
      if (error) throw error;
      setReturnPredictions(data || []);
    } catch (err) {
      console.error('Erro ao buscar previsões de retorno:', err);
    }
  };

  const availableSlots = useMemo(() => {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const selectedDateEvents = events.filter(e => isSameDay(new Date(e.data + 'T00:00:00'), selectedDate));
    
    return hours.filter(h => !selectedDateEvents.some(e => e.hora_inicio.substring(0, 5) === h));
  }, [events, selectedDate]);

  const fetchPatients = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('nutricionista_id', user.id);
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="calendar-header">
      <div className="calendar-month-info">
        <h2>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h2>
      </div>
      <div className="calendar-nav">
        <button onClick={prevMonth} className="btn-icon-round"><ChevronLeft size={20} /></button>
        <button onClick={() => setCurrentMonth(new Date())} className="btn-secondary-sm">Hoje</button>
        <button onClick={nextMonth} className="btn-icon-round"><ChevronRight size={20} /></button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="calendar-days-row">
        {days.map(day => <div key={day} className="calendar-day-label">{day}</div>)}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = events.filter(e => isSameDay(new Date(e.data + 'T00:00:00'), cloneDay));
        const dayPredictions = returnPredictions.filter(p => isSameDay(new Date(p.proximo_retorno + 'T00:00:00'), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`calendar-cell ${
              !isSameMonth(day, monthStart) ? "disabled" : 
              isSameDay(day, selectedDate) ? "selected" : ""
            } ${isToday(day) ? "today" : ""}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className="cell-number">{formattedDate}</span>
            <div className="cell-events">
              {dayEvents.map(e => (
                <div key={e.id} className="event-dot" title={`Agendado: ${e.pacientes?.nome}`}></div>
              ))}
              {dayPredictions.map((p, idx) => (
                <div key={idx} className="prediction-dot" title={`Retorno previsto: ${p.pacientes?.nome}`}></div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="calendar-row" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  const selectedDateEvents = events
    .filter(e => isSameDay(new Date(e.data + 'T00:00:00'), selectedDate))
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const selectedDatePredictions = returnPredictions
    .filter(p => isSameDay(new Date(p.proximo_retorno + 'T00:00:00'), selectedDate));

  if (loading && events.length === 0) return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <PremiumLoading message="Preparando sua agenda..." />
      </main>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content premium-fade-in">
        <header className="page-header premium-profile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="icon-badge"><CalendarIcon size={24} /></div>
            <div>
              <h1>Agenda NutriLuar</h1>
              <p className="text-muted">📅 Gerencie seus atendimentos e horários</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Agendar Consulta
          </button>
        </header>

        <div className="agenda-grid">
          <div className="calendar-container premium-card">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <div className="calendar-legend" style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="event-dot" style={{ position: 'static', margin: 0 }}></div>
                <span>Agendado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="prediction-dot" style={{ position: 'static', margin: 0 }}></div>
                <span>Previsão de Retorno</span>
              </div>
            </div>
          </div>

          <div className="events-panel premium-card">
            <h3 className="panel-title">
              Atendimentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            
            <div className="events-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map(event => (
                  <div key={event.id} className="agenda-event-item">
                    <div className="event-time">
                      <Clock size={16} />
                      {event.hora_inicio.substring(0, 5)}
                    </div>
                    <div className="event-info">
                      <div className="event-patient">
                        <User size={16} />
                        {event.pacientes?.nome || event.titulo || 'Sem título'}
                      </div>
                      {event.observacoes && (
                        <div className="event-notes">
                          <MessageSquare size={14} />
                          {event.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : selectedDatePredictions.length === 0 && (
                <div className="no-events">
                  <p>✨ Nenhum compromisso oficial.</p>
                </div>
              )}

              {selectedDatePredictions.map((p, idx) => (
                <div key={idx} className="agenda-event-item prediction">
                  <div className="event-time">Retorno</div>
                  <div className="event-info">
                    <div className="event-patient">
                      <User size={16} />
                      {p.pacientes?.nome} (Previsto)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="panel-title" style={{ marginTop: '30px' }}>
              Horários Disponíveis
            </h3>
            <div className="slots-grid">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <button 
                    key={slot} 
                    className="slot-button"
                    onClick={() => {
                      setSelectedTime(slot);
                      setIsModalOpen(true);
                    }}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Agenda lotada para este dia.</p>
              )}
            </div>
          </div>
        </div>

        <AgendaModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTime(undefined);
          }} 
          onSave={fetchEvents}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </main>
    </div>
  );
};

export default Agenda;
