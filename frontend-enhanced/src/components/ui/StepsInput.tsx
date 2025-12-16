import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface StepsInputProps {
  value: number;
  onChange: (steps: number) => void;
}

export const StepsInput: React.FC<StepsInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val === '') {
      onChange(30); // default value
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1 && num <= 100) {
        onChange(num);
      }
    }
  };

  const increment = () => {
    const newVal = Math.min(100, value + 1);
    onChange(newVal);
    setInputValue(newVal.toString());
  };

  const decrement = () => {
    const newVal = Math.max(1, value - 1);
    onChange(newVal);
    setInputValue(newVal.toString());
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-textSecondary">Steps</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          className="p-1.5 rounded-lg bg-surface border-borderSoft text-textSecondary hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
          disabled={value <= 1}
        >
          <span className="text-xs">-</span>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-16 px-2 py-1.5 rounded-lg bg-surface border border-borderSoft text-xs text-textPrimary text-center focus:outline-none focus:border-accent/50"
        />
        <button
          type="button"
          onClick={increment}
          className="p-1.5 rounded-lg bg-surface border border-borderSoft text-textSecondary hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
          disabled={value >= 100}
        >
          <span className="text-xs">+</span>
        </button>
      </div>
    </div>
 );
};