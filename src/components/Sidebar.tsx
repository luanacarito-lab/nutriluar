import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Calendar, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { signOut } = useAuth();

  return (
    <aside className={`sidebar premium-sidebar ${isMobile ? 'mobile' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo />
        {isMobile && (
          <button className="btn-icon" onClick={onClose} style={{ color: 'var(--color-text)' }}>
            <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active premium-nav" : "nav-item"}
        >
          <LayoutDashboard size={20} />
          <span>📊 Dashboard</span>
        </NavLink>
        <NavLink 
          to="/pacientes" 
          className={({ isActive }) => isActive ? "nav-item active premium-nav" : "nav-item"}
        >
          <Users size={20} />
          <span>👥 Pacientes</span>
        </NavLink>
        <NavLink 
          to="/agenda" 
          className={({ isActive }) => isActive ? "nav-item active premium-nav" : "nav-item"}
        >
          <Calendar size={20} />
          <span>📅 Agenda</span>
        </NavLink>
      </nav>

      <footer className="sidebar-footer">
        <button onClick={signOut} className="btn-logout premium-logout">
          <LogOut size={18} />
          <span>🚪 Sair do Sistema</span>
        </button>
      </footer>
    </aside>
  );
};

export default Sidebar;
