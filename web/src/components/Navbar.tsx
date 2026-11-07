import React from 'react'
import {
  Cpu,
  GraduationCap,
  Trophy,
  PlayCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Table2,
  Binary,
  Code2,
  HelpCircle
} from 'lucide-react'
import { sounds } from '../utils/audio'

export type AppMode = 'learn' | 'challenge' | 'simulate'

interface NavbarProps {
  mode: AppMode
  setMode: (mode: AppMode) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  placedCount: number
  totalCount: number
  onReset: () => void
  onAutoComplete: () => void
  onOpenFormats: () => void
  onOpenControlTable: () => void
  onOpenHelp: () => void
  challengeTime: number
  challengeScore: number
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  soundEnabled,
  setSoundEnabled,
  placedCount,
  totalCount,
  onReset,
  onAutoComplete,
  onOpenFormats,
  onOpenControlTable,
  onOpenHelp,
  challengeTime,
  challengeScore
}) => {
  const toggleSound = () => {
    const newState = sounds.toggleSound()
    setSoundEnabled(newState)
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = Math.round((placedCount / totalCount) * 100)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-7xl">
        {/* Logo y Título */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                MIPS 32-bit <span className="text-cyan-400 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">Diapositiva 17</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Seminario Arquitectura de Computadoras · CUCEI · UdeG
            </p>
          </div>
        </div>

        {/* Selector de Modo Central */}
        <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              sounds.playClick()
              setMode('learn')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'learn'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Modo Aprender con siluetas y pistas"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Aprender</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setMode('challenge')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'challenge'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Modo Reto a ciegas con cronómetro y puntuación"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Reto</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              setMode('simulate')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'simulate'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Simulación interactiva paso a paso de instrucciones"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Simulación</span>
          </button>
        </div>

        {/* Estadísticas de Modo / Progreso */}
        <div className="flex items-center gap-2">
          {mode === 'challenge' ? (
            <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-1 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                <span className="text-amber-500">⏱</span>
                <span>{formatTimer(challengeTime)}</span>
              </div>
              <div className="h-3 w-px bg-amber-500/30" />
              <div className="flex items-center gap-1 text-amber-200 font-mono">
                <span className="text-slate-400">Pts:</span>
                <span className="font-bold">{challengeScore}</span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 text-xs">
              <span className="text-slate-400">Progreso:</span>
              <span className="font-mono font-bold text-cyan-400">
                {placedCount}/{totalCount}
              </span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Botones de acción modal */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sounds.playClick()
                onOpenFormats()
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              title="Ver formatos de instrucción Tipo R, I, J"
            >
              <Binary className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Formatos</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                onOpenControlTable()
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              title="Tabla de señales de la Unidad de Control"
            >
              <Table2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden lg:inline">Unidad Control</span>
            </button>

            {mode !== 'simulate' && (
              <>
                <button
                  onClick={() => {
                    sounds.playSnap()
                    onAutoComplete()
                  }}
                  className="p-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 transition-colors"
                  title="Colocar todas las piezas automáticamente"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                </button>

                <button
                  onClick={() => {
                    sounds.playClick()
                    onReset()
                  }}
                  className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                  title="Reiniciar rompecabezas"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick()
                onOpenHelp()
              }}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Guía y créditos del equipo"
            >
              <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            </button>

            <a
              href="https://github.com/TilinezzZ/ProyFinalSlides"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Ver código fuente en GitHub"
            >
              <Code2 className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
