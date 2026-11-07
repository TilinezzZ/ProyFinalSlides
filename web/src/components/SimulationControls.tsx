import React from 'react'
import type {
  SimulationScenario,
  SimulationStep
} from '../data/instructions'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Gauge
} from 'lucide-react'
import { sounds } from '../utils/audio'

interface SimulationControlsProps {
  scenarios: SimulationScenario[]
  selectedScenarioId: string
  onSelectScenario: (scenarioId: string) => void
  currentStepIndex: number
  onStepChange: (stepIndex: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  onReset: () => void
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onReset
}) => {
  const currentScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0]
  const currentStep: SimulationStep = currentScenario.steps[currentStepIndex] || currentScenario.steps[0]

  const phases = [
    { num: 1, label: 'Fetch' },
    { num: 2, label: 'Decode' },
    { num: 3, label: 'Execute' },
    { num: 4, label: 'Memory' },
    { num: 5, label: 'WriteBack' }
  ]

  return (
    <div className="w-full border-t border-cyan-900/40 bg-slate-950/95 backdrop-blur-md p-3 sm:p-4 shadow-2xl">
      <div className="mx-auto max-w-7xl flex flex-col gap-3">
        {/* Barra 1: Selector de Instrucción a Simular */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Instrucción:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    sounds.playClick()
                    onSelectScenario(sc.id)
                  }}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    selectedScenarioId === sc.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {sc.assembly}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Hex: {currentScenario.hexCode}
            </span>
          </div>
        </div>

        {/* Barra 2: Stepper de Fases y Controles de Reproducción */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Stepper de Fases */}
          <div className="flex items-center gap-1 sm:gap-2">
            {phases.map((ph, idx) => {
              const isCurrent = currentStepIndex === idx
              const isPast = currentStepIndex > idx

              return (
                <button
                  key={ph.num}
                  onClick={() => {
                    sounds.playPulse()
                    onStepChange(idx)
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                      : isPast
                      ? 'bg-slate-900 text-slate-300 border border-slate-800'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-mono ${
                      isCurrent
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : isPast
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {ph.num}
                  </span>
                  <span className="hidden sm:inline">{ph.label}</span>
                </button>
              )
            })}
          </div>

          {/* Botones de Reproducción */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick()
                onReset()
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
              title="Reiniciar simulación al paso 1"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (currentStepIndex > 0) {
                  sounds.playPulse()
                  onStepChange(currentStepIndex - 1)
                }
              }}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 disabled:opacity-40 transition-colors"
              title="Paso anterior"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                sounds.playPulse()
                onTogglePlay()
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
              }`}
              title={isPlaying ? 'Pausar simulación' : 'Reproducir automáticamente'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Auto</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < currentScenario.steps.length - 1) {
                  sounds.playPulse()
                  onStepChange(currentStepIndex + 1)
                }
              }}
              disabled={currentStepIndex === currentScenario.steps.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 disabled:opacity-40 transition-colors"
              title="Siguiente paso"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Selector de velocidad */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-1">
              <Gauge className="h-3 w-3 text-slate-500 ml-1.5" />
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    sounds.playClick()
                    onSpeedChange(s)
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    speed === s
                      ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjeta explicativa de la fase actual */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-cyan-900/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {currentStep.title}:
              </span>
              <span className="text-xs font-semibold text-white">
                {currentStep.subtitle}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          {/* Señales de Control activas en este instante */}
          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 flex-wrap sm:min-w-[190px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
              Señales de Control:
            </span>
            <div className="flex flex-wrap gap-1 justify-end">
              {Object.entries(currentStep.controlSignalValues).map(([sig, val]) => (
                <span
                  key={sig}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    val === 1 || val === '1' || val === '10' || val === '01'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60 font-bold'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                  title={`${sig} = ${val}`}
                >
                  {sig}:{val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
