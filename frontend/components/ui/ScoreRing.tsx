'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorFn?: (score: number) => string;
  className?: string;
}

function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
  colorFn,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  const defaultColor = (s: number) => {
    if (s >= 70) return '#22c55e';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const color = colorFn ? colorFn(score) : defaultColor(score);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F2F2F2"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs font-semibold text-[#0E2347]">{label}</span>}
      {sublabel && <span className="text-xs text-gray-400">{sublabel}</span>}
    </div>
  );
}

export { ScoreRing };
