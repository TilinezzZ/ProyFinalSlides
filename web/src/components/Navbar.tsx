import React from 'react'
import {
  Cpu,
  Layers,
  Table2,
  Binary,
  Database,
  CornerDownRight,
  ArrowLeftRight,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  HelpCircle,
  Code2,
  Zap
} from 'lucide-react'
import { sounds } from '../utils/audio'

export type NavRoute = 'datapath' | 'control' | 'tipo-r' | 'lw' | 'tipo-j' | 'comparar'
export type GlobalInstruction = 'R' | 'lw' | 'sw' | 'beq' | 'j'

interface NavbarProps {
  currentRoute: NavRoute
  onNavigate: (route: NavRoute) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  globalInstruction: GlobalInstruction
  onSelectGlobalInstruction: (instr: GlobalInstruction) => void
  onOpenFormats: () => void
  onOpenHelp: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  globalInstruction,
  onSelectGlobalInstruction,
  onOpenFormats,
  onOpenHelp
}) => {
  const isLight = theme === 'light'

  const navItems: { route: NavRoute; label: string; icon: React.ReactNode; path: string }[] = [
    { route: 'datapath', label: 'Datapath', icon: <Cpu className="h-3.5 w-3.5" />, path: '/' },
    { route: 'control', label: 'Unidad de Control', icon: <Table2 className="h-3.5 w-3.5" />, path: '/control' },
    { route: 'tipo-r', label: 'Tipo R', icon: <Layers className="h-3.5 w-3.5" />, path: '/tipo-r' },
    { route: 'lw', label: 'LW / SW', icon: <Database className="h-3.5 w-3.5" />, path: '/lw' },
    { route: 'tipo-j', label: 'Tipo J', icon: <CornerDownRight className="h-3.5 w-3.5" />, path: '/tipo-j' },
    { route: 'comparar', label: 'Comparar', icon: <ArrowLeftRight className="h-3.5 w-3.5" />, path: '/comparar' }
  ]

  const instructions: GlobalInstruction[] = ['R', 'lw', 'sw', 'beq', 'j']

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors ${
      isLight
        ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
        : 'bg-slate-950/85 border-cyan-900/40 text-slate-100'
    }`}>
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-7xl">

        <div
          onClick={() => {
            sounds.playClick()
            onNavigate('datapath')
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-md group-hover:scale-105 transition-transform">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight font-mono">
                MIPS 32-bit
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Procesador Monociclo
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-xl bg-slate-900/70 p-1 border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route
            return (
              <button
                key={item.route}
                onClick={() => {
                  sounds.playClick()
                  onNavigate(item.route)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={`Ir a ${item.label}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">

          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Zap className="h-3 w-3 text-emerald-400" />
              Camino:
            </span>
            {instructions.map((ins) => (
              <button
                key={ins}
                onClick={() => {
                  sounds.playPulse()
                  onSelectGlobalInstruction(ins)
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                  globalInstruction === ins
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Resaltar camino para ${ins}`}
              >
                {ins}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sounds.playClick()
              onOpenFormats()
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Formatos MIPS Tipo R, I, J"
          >
            <Binary className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Formatos</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              onToggleTheme()
            }}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
            aria-label="Cambiar tema"
          >
            {isLight ? <Moon className="h-3.5 w-3.5 text-indigo-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick()
              onToggleSound()
            }}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
            aria-label="Alternar sonido"
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
            title="Guía y créditos"
            aria-label="Ayuda"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
          </button>

          <a
            href="https://github.com/TilinezzZ/ProyFinalSlides"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Ver código fuente en GitHub"
            aria-label="Repositorio GitHub"
          >
            <Code2 className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}
