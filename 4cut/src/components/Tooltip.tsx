import React, { useState, useRef } from 'react';
import '../styles/Tooltip.css';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="tooltip-content" ref={tooltipRef}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
