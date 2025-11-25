import React, { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface SeedInputProps {
  value: number | null;
  onChange: (seed: number | null) => void;
}

export const SeedInput: React.FC<SeedInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(value !== null ? value.toString() : '');
  const [isRandom, setIsRandom] = useState<boolean>(value === null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val === '') {
      onChange(null);
      setIsRandom(true);
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 99999) {
        onChange(num);
        setIsRandom(false);
      }
    }
  };

  const handleRandomize = () => {
    const randomSeed = Math.floor(Math.random() * 100000);
    setInputValue(randomSeed.toString());
    onChange(randomSeed);
    setIsRandom(true);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-textSecondary">Seed</label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Random"
          className="w-20 px-2 py-1.5 rounded-lg bg-surface border border-borderSoft text-xs text-textPrimary focus:outline-none focus:border-accent/50"
        />
        <button
          type="button"
          onClick={handleRandomize}
          className="p-1.5 rounded-lg bg-surface border border-borderSoft text-textSecondary hover:border-accent/50 hover:text-accent transition-colors"
          title="Random seed"
        >
          <Dice1 size={14} />
        </button>
      </div>
    </div>
  );
};