import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Trophy, Clock, Zap, RotateCcw } from 'lucide-react'
import { sounds } from '../utils/audio'

interface ChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  time: number
  mistakes: number
  onPlayAgain: () => void
  onStartSimulation: () => void
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  score,
  time,
  mistakes,
  onPlayAgain,
  onStartSimulation
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playVictory()
      // Disparar confetti festivo
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const accuracy = Math.max(0, Math.round(((18) / (18 + mistakes)) * 100))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl shadow-amber-950/50 p-6 flex flex-col items-center text-center space-y-4">
        {/* Trofeo y Resplandor */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/40 border border-amber-500/50 shadow-xl shadow-amber-500/20 animate-bounce">
          <Trophy className="h-8 w-8 text-amber-300" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            ¡Datapath Completo Armado!
          </h3>
          <p className="text-xs text-amber-300/80 mt-1 font-mono">
            Rango: Arquitecto MIPS Nivel Experto · CUCEI
          </p>
        </div>

        {/* Estadísticas */}
        <div className="w-full grid grid-cols-3 gap-2 py-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono">Puntuación</span>
            <span className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
              {score}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono">Tiempo</span>
            <div className="flex items-center gap-1 mt-0.5 text-cyan-400 font-mono text-base font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimer(time)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono">Precisión</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
              {accuracy}%
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          Has conectado correctamente los 18 componentes del procesador MIPS monociclo fiel a la diapositiva 17. ¡Tu procesador está listo para simular instrucciones!
        </p>

        {/* Acciones */}
        <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => {
              sounds.playClick()
              onPlayAgain()
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Volver a jugar</span>
          </button>

          <button
            onClick={() => {
              sounds.playPulse()
              onStartSimulation()
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>Iniciar Simulación</span>
          </button>
        </div>
      </div>
    </div>
  )
}
