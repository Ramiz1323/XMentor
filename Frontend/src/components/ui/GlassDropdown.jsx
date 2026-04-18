import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const GlassDropdown = ({ label, options = [], value, onChange, placeholder = "Select option", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = (options || []).find(opt => opt.value === value);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="glass-dropdown-wrapper" ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      <div 
        className={`glass-dropdown-trigger ${isOpen ? 'open' : ''}`} 
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label || placeholder}
      >
        <div className="trigger-content">
          {Icon && <Icon size={18} className="trigger-icon" aria-hidden="true" />}
          <span className={!selectedOption ? 'placeholder' : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} aria-hidden="true" />
      </div>

      {isOpen && (
        <div className="glass-dropdown-menu" role="listbox">
          {(options || []).map((option) => (
            <div 
              key={option.value} 
              className={`glass-dropdown-item ${value === option.value ? 'selected' : ''}`}
              role="option"
              aria-selected={value === option.value}
              tabIndex={0}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlassDropdown;
