'use client';

import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, FastForward, Clock } from 'lucide-react';

interface ReplayControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentDateText: string;
  progressPercent: number;
}

export function ReplayControls({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  currentDateText,
  progressPercent,
}: ReplayControlsProps) {
  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm backdrop-blur">
      {/* Playback action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          title="Reiniciar al inicio"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 fill-white" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Reproducir</span>
            </>
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={isPlaying}
          title="Avanzar 1 Vela"
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          <SkipForward className="h-4 w-4" />
          <span>Avanzar Vela</span>
        </button>
      </div>

      {/* Progress & Current Timestamp */}
      <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
            {currentDateText || 'Cargando vela...'}
          </span>
          <span className="text-[11px] text-slate-400">({progressPercent.toFixed(0)}%)</span>
        </div>
        <div className="w-full sm:w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Speed multiplier selector */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
              speed === s
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
