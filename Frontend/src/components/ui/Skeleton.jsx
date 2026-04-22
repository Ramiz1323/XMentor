import React from 'react';
import '../../styles/_utilities.scss'; // Ensure utilities are available if not global

/**
 * A premium skeleton loader with shimmer effects.
 * @param {string} width - Width of the skeleton (e.g., '100%')
 * @param {string} height - Height of the skeleton (e.g., '20px')
 * @param {string} variant - 'rect' or 'circle'
 * @param {string} className - Optional extra classes
 */
const Skeleton = ({ width, height, variant = 'rect', className = '', style = {} }) => {
  const baseStyle = {
    width: width || '100%',
    height: height || '20px',
    ...style
  };

  return (
    <div 
      className={`skeleton ${variant} ${className}`} 
      style={baseStyle}
    />
  );
};

export default Skeleton;
