import React from 'react';
import { ToneLevel, WritingContext } from '../types';
import { getToneLevelRange } from '../utils/toneLevelUtils';

interface ToneSliderProps {
  value: ToneLevel;
  onChange: (value: ToneLevel) => void;
  context: WritingContext;
}

const ToneSlider: React.FC<ToneSliderProps> = ({ value, onChange, context }) => {
  const labels = {
    1: '단호하고 직관적인',
    2: '정중하고 담백한',
    3: '친근하고 명확한',
    4: '세심하고 공감하는',
    5: '생동감 있고 표현적인'
  };

  const range = getToneLevelRange(context);
  const isLevelDisabled = (level: ToneLevel) => level < range.min || level > range.max;

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-medium">
        <span>명확함</span>
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100">
          Lv.{value} {labels[value]}
        </span>
        <span>표현적</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value) as ToneLevel;
          // 범위 내의 값만 허용
          if (!isLevelDisabled(newValue)) {
            onChange(newValue);
          }
        }}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      />

      {/* 레벨별 표시 */}
      <div className="flex justify-between mt-3 px-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`text-xs text-center ${isLevelDisabled(level as ToneLevel)
              ? 'text-slate-300'
              : level === value
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500'
              }`}
          >
            Lv.{level}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToneSlider;