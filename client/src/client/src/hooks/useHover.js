import { useState } from 'react';

export const useHover = (normalStyle, hoverStyle) => {
  const [hovered, setHovered] = useState(false);
  return {
    style: hovered ? { ...normalStyle, ...hoverStyle } : normalStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  };
};