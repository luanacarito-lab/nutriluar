import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Sidebar: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <aside className="sidebar">
      <Logo />
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LayoutDashboard />
          Dashboard
        </NavLink>
        <NavLink 
          to="/pacientes" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <Users />
          Pacientes
        </NavLink>
      </nav>

      <footer className="sidebar-footer">
        <button onClick={signOut} className="btn-logout">
          <LogOut />
          Sair do Sistema
        </button>
      </footer>
    </aside>
  );
};

export default Sidebar;
