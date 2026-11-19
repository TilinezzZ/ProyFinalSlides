import React, { useState, useEffect, useRef } from 'react'
import { DatapathCanvas } from '../components/DatapathCanvas'
import { Palette } from '../components/Palette'
import { ComponentInspector } from '../components/ComponentInspector'
import { SimulationControls } from '../components/SimulationControls'
import { ChallengeModal } from '../components/ChallengeModal'
import { COMPONENTS, type DatapathComponent } from '../data/components'
import { WIRES } from '../data/wires'
import { SIMULATION_SCENARIOS, type SimulationScenario } from '../data/instructions'
import { sounds } from '../utils/audio'
import { GraduationCap, Trophy, PlayCircle, Sparkles, RotateCcw } from 'lucide-react'

export type DatapathPuzzleMode = 'learn' | 'challenge' | 'simulate'

interface DatapathViewProps {
  theme?: 'dark' | 'light'
  globalInstruction?: 'R' | 'lw' | 'sw' | 'beq' | 'j'
}

export const DatapathView: React.FC<DatapathViewProps> = ({
  globalInstruction = 'R'
}) => {
  const [puzzleMode, setPuzzleMode] = useState<DatapathPuzzleMode>('learn')
  const [selectedPaletteComponentId, setSelectedPaletteComponentId] = useState<string | null>(null)
  const [inspectedComponent, setInspectedComponent] = useState<DatapathComponent | null>(null)
  const [challengeModalOpen, setChallengeModalOpen] = useState<boolean>(false)

  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }
    setFeedbackMessage({ text, type })
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedbackMessage(null)
    }, 3500)
  }

  const [placedComponents, setPlacedComponents] = useState<Record<string, boolean>>({})

  const [challengeTime, setChallengeTime] = useState<number>(0)
  const [challengeScore, setChallengeScore] = useState<number>(1000)
  const [mistakes, setMistakes] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(globalInstruction)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [simSpeed, setSimSpeed] = useState<number>(1)

  useEffect(() => {
    if (globalInstruction) {
      setSelectedScenarioId(globalInstruction === 'beq' ? 'beq_taken' : globalInstruction)
    }
  }, [globalInstruction])

  useEffect(() => {
    let interval: number | null = null
    if (puzzleMode === 'challenge' && isTimerActive) {
      interval = window.setInterval(() => {
        setChallengeTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [puzzleMode, isTimerActive])

  useEffect(() => {
    let timer: number | null = null
    if (puzzleMode === 'simulate' && isPlaying) {
      const currentScenario =
        SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
        SIMULATION_SCENARIOS[0]
      const stepDuration = 2200 / simSpeed

      timer = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < currentScenario.steps.length - 1) {
            sounds.playPulse()
            return prev + 1
          } else {
            setIsPlaying(false)
            return prev
          }
        })
      }, stepDuration)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [puzzleMode, isPlaying, selectedScenarioId, simSpeed])

  const handleModeChange = (newMode: DatapathPuzzleMode) => {
    sounds.playClick()
    setPuzzleMode(newMode)
    setIsPlaying(false)

    if (newMode === 'challenge') {
      setPlacedComponents({})
      setChallengeTime(0)
      setChallengeScore(1000)
      setMistakes(0)
      setIsTimerActive(true)
      showFeedback('¡Modo Reto iniciado! Arma el datapath a ciegas en el menor tiempo posible.', 'info')
    } else if (newMode === 'simulate') {
      handleAutoComplete()
      showFeedback('Modo Simulación activo: Selecciona una instrucción y explora el datapath paso a paso.', 'info')
    } else {
      setIsTimerActive(false)
      showFeedback('Modo Aprender activo: Arrastra las piezas con la ayuda de las siluetas.', 'info')
    }
  }

  const handleSlotDrop = (targetSlotId: string, droppedComponentId: string) => {
    const droppedComp = COMPONENTS.find((c) => c.id === droppedComponentId)
    const targetComp = COMPONENTS.find((c) => c.id === targetSlotId)

    if (!droppedComp || !targetComp) return

    if (droppedComponentId === targetSlotId) {
      sounds.playSnap()
      setPlacedComponents((prev) => {
        const updated = { ...prev, [targetSlotId]: true }
        const count = Object.values(updated).filter(Boolean).length

        if (count === COMPONENTS.length) {
          if (puzzleMode === 'challenge') {
            setIsTimerActive(false)
            setChallengeModalOpen(true)
          } else {
            sounds.playVictory()
            showFeedback('¡Felicidades! Has completado el datapath completo del procesador.', 'success')
          }
        } else {
          showFeedback(`¡Correcto! ${droppedComp.name} encajó en su lugar.`, 'success')
        }

        return updated
      })

      if (puzzleMode === 'challenge') {
        setChallengeScore((s) => s + 100)
      }
      setSelectedPaletteComponentId(null)
    } else {
      sounds.playError()
      if (puzzleMode === 'challenge') {
        setMistakes((m) => m + 1)
        setChallengeScore((s) => Math.max(0, s - 30))
      }
      showFeedback(`Incorrecto: ${droppedComp.hint}`, 'error')
    }
  }

  const handleRemovePlaced = (componentId: string) => {
    setPlacedComponents((prev) => ({
      ...prev,
      [componentId]: false
    }))
  }

  const handleAutoComplete = () => {
    sounds.playSnap()
    const allPlaced: Record<string, boolean> = {}
    COMPONENTS.forEach((c) => {
      allPlaced[c.id] = true
    })
    setPlacedComponents(allPlaced)
  }

  const handleReset = () => {
    sounds.playClick()
    setPlacedComponents({})
    setSelectedPaletteComponentId(null)
    if (puzzleMode === 'challenge') {
      setChallengeTime(0)
      setChallengeScore(1000)
      setMistakes(0)
      setIsTimerActive(true)
    }
    showFeedback('Lienzo reiniciado. ¡Comienza a armar el datapath!', 'info')
  }

  const currentScenario: SimulationScenario =
    SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    SIMULATION_SCENARIOS[0]
  const currentStep = currentScenario.steps[currentStepIndex] || currentScenario.steps[0]

  const activeComponentIds = puzzleMode === 'simulate' ? currentStep.activeComponentIds : []
  const activeWireIds = puzzleMode === 'simulate' ? currentStep.activeWireIds : []
  const busValues = puzzleMode === 'simulate' ? currentStep.busValues : {}

  const placedCount = Object.values(placedComponents).filter(Boolean).length
  const progressPercent = Math.round((placedCount / COMPONENTS.length) * 100)

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between overflow-hidden">

      <div className="w-full px-4 py-2 border-b border-cyan-900/30 bg-slate-950/60 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => handleModeChange('learn')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                puzzleMode === 'learn'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Aprender</span>
            </button>
            <button
              onClick={() => handleModeChange('challenge')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                puzzleMode === 'challenge'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Reto</span>
            </button>
            <button
              onClick={() => handleModeChange('simulate')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                puzzleMode === 'simulate'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Simulación</span>
            </button>
          </div>

          {puzzleMode !== 'simulate' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleAutoComplete}
                className="p-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50"
                title="Colocar todas automáticamente"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800"
                title="Reiniciar rompecabezas"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {puzzleMode === 'challenge' ? (
            <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-1 text-xs font-mono">
              <span className="text-amber-400">
                ⏱ {Math.floor(challengeTime / 60)}:{(challengeTime % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-200 font-bold">{challengeScore} pts</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 text-xs">
              <span className="text-slate-400">Piezas:</span>
              <span className="font-mono font-bold text-cyan-400">
                {placedCount}/{COMPONENTS.length}
              </span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="w-full flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <DatapathCanvas
          mode={puzzleMode}
          components={COMPONENTS}
          placedComponents={placedComponents}
          wires={WIRES}
          activeComponentIds={activeComponentIds}
          activeWireIds={activeWireIds}
          busValues={busValues}
          onSlotDrop={handleSlotDrop}
          onSelectComponent={(comp) => setInspectedComponent(comp)}
          onRemovePlaced={handleRemovePlaced}
          selectedPaletteComponentId={selectedPaletteComponentId}
          feedbackMessage={feedbackMessage}
        />
      </main>

      <footer className="w-full shrink-0 z-30">
        {puzzleMode === 'simulate' ? (
          <SimulationControls
            scenarios={SIMULATION_SCENARIOS}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={(id) => {
              setSelectedScenarioId(id)
              setCurrentStepIndex(0)
              setIsPlaying(false)
            }}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={simSpeed}
            onSpeedChange={setSimSpeed}
            onReset={() => {
              setCurrentStepIndex(0)
              setIsPlaying(false)
            }}
          />
        ) : (
          <Palette
            components={COMPONENTS}
            placedComponents={placedComponents}
            selectedComponentId={selectedPaletteComponentId}
            onSelectComponent={setSelectedPaletteComponentId}
            onInspectComponent={(comp) => setInspectedComponent(comp)}
          />
        )}
      </footer>

      <ComponentInspector
        component={inspectedComponent}
        onClose={() => setInspectedComponent(null)}
      />

      <ChallengeModal
        isOpen={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        score={challengeScore}
        time={challengeTime}
        mistakes={mistakes}
        onPlayAgain={handleReset}
        onStartSimulation={() => {
          setChallengeModalOpen(false)
          handleModeChange('simulate')
        }}
      />
    </div>
  )
}
