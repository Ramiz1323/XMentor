import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const GlassDropdown = ({ label, options, value, onChange, placeholder = "Select option", icon: Icon }) => {
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="glass-dropdown-wrapper" ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      <div 
        className={`glass-dropdown-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {Icon && <Icon size={18} className="trigger-icon" />}
          <span className={!selectedOption ? 'placeholder' : ''}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className="glass-dropdown-menu">
          {options.map((option) => (
            <div 
              key={option.value} 
              className={`glass-dropdown-item ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
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
