import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn"
      aria-label="Alternar tema"
      title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
    >
      {theme === 'light' ? (
        <Moon size={20} className="theme-icon-moon" />
      ) : (
        <Sun size={20} className="theme-icon-sun" />
      )}
    </button>
  );
};

export default ThemeToggle;
