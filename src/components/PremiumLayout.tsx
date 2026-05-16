import React, { useEffect, useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

interface PremiumLayoutProps {
  children: React.ReactNode;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ children }) => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Efeito Parallax Extremamente Sutil (reduzido para performance)
      if (layoutRef.current && window.innerWidth > 1024) {
        const x = (e.clientX / window.innerWidth - 0.5) * 3; 
        const y = (e.clientY / window.innerHeight - 0.5) * 3;
        layoutRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div className="bg-nature-overlay" />
      <div className="bokeh-bubble" style={{ width: '400px', height: '400px', top: '5%', left: '5%' }} />
      <div className="bokeh-bubble" style={{ width: '500px', height: '500px', bottom: '10%', right: '5%', animationDelay: '-5s' }} />
      <div className="bokeh-bubble" style={{ width: '300px', height: '300px', top: '40%', left: '30%', animationDelay: '-10s' }} />
      <div className="bokeh-bubble" style={{ width: '350px', height: '350px', bottom: '20%', left: '10%', animationDelay: '-15s' }} />
      
      <ThemeToggle />
      
      <div 
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`} 
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />
      <div ref={layoutRef} style={{ transition: 'transform 0.2s ease-out', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
};

export default PremiumLayout;
