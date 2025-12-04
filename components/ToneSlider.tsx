import React from 'react';
import { ToneLevel } from '../types';

interface ToneSliderProps {
  value: ToneLevel;
  onChange: (value: ToneLevel) => void;
}

const ToneSlider: React.FC<ToneSliderProps> = ({ value, onChange }) => {
  const labels = {
    1: '명확하고 직관적',
    2: '정중하고 신뢰감',
    3: '부드럽고 친근함',
    4: '감성적이고 따뜻함',
    5: '위트있고 표현적'
  };

  return (
    <div className="w-full py-4">
      <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
        <span>명확함 (Clear)</span>
        <span>표현적 (Expressive)</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as ToneLevel)}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      />
      <div className="mt-2 text-center">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100">
          Lv.{value} {labels[value]}
        </span>
      </div>
    </div>
  );
};

export default ToneSlider;