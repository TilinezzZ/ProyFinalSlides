import { useState, useEffect, useRef } from 'react'
import { Navbar, type AppMode } from './components/Navbar'
import { DatapathCanvas } from './components/DatapathCanvas'
import { Palette } from './components/Palette'
import { ComponentInspector } from './components/ComponentInspector'
import { InstructionFormats } from './components/InstructionFormats'
import { ControlUnitTable } from './components/ControlUnitTable'
import { SimulationControls } from './components/SimulationControls'
import { ChallengeModal } from './components/ChallengeModal'
import { HelpModal } from './components/HelpModal'
import { COMPONENTS, type DatapathComponent } from './data/components'
import { WIRES } from './data/wires'
import { SIMULATION_SCENARIOS, type SimulationScenario } from './data/instructions'
import { sounds } from './utils/audio'

export function App() {
  // Estados de Modo y UI
  const [mode, setMode] = useState<AppMode>('learn')
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [selectedPaletteComponentId, setSelectedPaletteComponentId] = useState<string | null>(null)
  const [inspectedComponent, setInspectedComponent] = useState<DatapathComponent | null>(null)

  // Estados de Modales
  const [formatsOpen, setFormatsOpen] = useState<boolean>(false)
  const [controlTableOpen, setControlTableOpen] = useState<boolean>(false)
  const [helpOpen, setHelpOpen] = useState<boolean>(false)
  const [challengeModalOpen, setChallengeModalOpen] = useState<boolean>(false)

  // Feedback Toast flotante
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

  // Componentes colocados en el datapath: Record<id, boolean>
  const [placedComponents, setPlacedComponents] = useState<Record<string, boolean>>({})

  // Estado del Modo Reto
  const [challengeTime, setChallengeTime] = useState<number>(0)
  const [challengeScore, setChallengeScore] = useState<number>(1000)
  const [mistakes, setMistakes] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)

  // Estado de la Simulación
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('R')
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [simSpeed, setSimSpeed] = useState<number>(1)

  // Cronómetro del Modo Reto
  useEffect(() => {
    let interval: number | null = null
    if (mode === 'challenge' && isTimerActive) {
      interval = window.setInterval(() => {
        setChallengeTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [mode, isTimerActive])

  // Temporizador de Simulación Automática
  useEffect(() => {
    let timer: number | null = null
    if (mode === 'simulate' && isPlaying) {
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
            // Llegó al final: pausar o reiniciar
            setIsPlaying(false)
            return prev
          }
        })
      }, stepDuration)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [mode, isPlaying, selectedScenarioId, simSpeed])

  // Cambios al alternar modos
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setIsPlaying(false)

    if (newMode === 'challenge') {
      // Reiniciar estadísticas del reto
      setPlacedComponents({})
      setChallengeTime(0)
      setChallengeScore(1000)
      setMistakes(0)
      setIsTimerActive(true)
      showFeedback('¡Modo Reto iniciado! Arma el datapath a ciegas en el menor tiempo posible.', 'info')
    } else if (newMode === 'simulate') {
      // Asegurarse de que el datapath esté completo para simular
      handleAutoComplete()
      showFeedback('Modo Simulación activo: Selecciona una instrucción y explora el datapath paso a paso.', 'info')
    } else {
      setIsTimerActive(false)
      showFeedback('Modo Aprender activo: Arrastra las piezas con la ayuda de las siluetas.', 'info')
    }
  }

  // Manejo de Colocación (Drag & Drop o Tap-to-Place)
  const handleSlotDrop = (targetSlotId: string, droppedComponentId: string) => {
    const droppedComp = COMPONENTS.find((c) => c.id === droppedComponentId)
    const targetComp = COMPONENTS.find((c) => c.id === targetSlotId)

    if (!droppedComp || !targetComp) return

    if (droppedComponentId === targetSlotId) {
      // ¡Acierto!
      sounds.playSnap()
      setPlacedComponents((prev) => {
        const updated = { ...prev, [targetSlotId]: true }
        const count = Object.values(updated).filter(Boolean).length

        if (count === COMPONENTS.length) {
          // Completó todas las piezas
          if (mode === 'challenge') {
            setIsTimerActive(false)
            setChallengeModalOpen(true)
          } else {
            sounds.playVictory()
            showFeedback('¡Felicidades! Has completado el datapath completo de la diapositiva 17.', 'success')
          }
        } else {
          showFeedback(`¡Correcto! ${droppedComp.name} encajó en su lugar.`, 'success')
        }

        return updated
      })

      if (mode === 'challenge') {
        setChallengeScore((s) => s + 100)
      }
      setSelectedPaletteComponentId(null)
    } else {
      // Error
      sounds.playError()
      if (mode === 'challenge') {
        setMistakes((m) => m + 1)
        setChallengeScore((s) => Math.max(0, s - 30))
      }
      showFeedback(`Incorrecto: ${droppedComp.hint}`, 'error')
    }
  }

  // Deshacer colocación
  const handleRemovePlaced = (componentId: string) => {
    setPlacedComponents((prev) => ({
      ...prev,
      [componentId]: false
    }))
  }

  // Auto-completar todas las piezas
  const handleAutoComplete = () => {
    const allPlaced: Record<string, boolean> = {}
    COMPONENTS.forEach((c) => {
      allPlaced[c.id] = true
    })
    setPlacedComponents(allPlaced)
  }

  // Reiniciar
  const handleReset = () => {
    setPlacedComponents({})
    setSelectedPaletteComponentId(null)
    if (mode === 'challenge') {
      setChallengeTime(0)
      setChallengeScore(1000)
      setMistakes(0)
      setIsTimerActive(true)
    }
    showFeedback('Lienzo reiniciado. ¡Comienza a armar el datapath!', 'info')
  }

  // Iniciar simulación de una instrucción seleccionada desde la tabla de control
  const handleSimulateInstruction = (instructionId: 'R' | 'lw' | 'sw' | 'beq_taken' | 'j') => {
    handleAutoComplete()
    setMode('simulate')
    setSelectedScenarioId(instructionId)
    setCurrentStepIndex(0)
    setIsPlaying(true)
  }

  // Calcular datos activos para simulación
  const currentScenario: SimulationScenario =
    SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    SIMULATION_SCENARIOS[0]
  const currentStep = currentScenario.steps[currentStepIndex] || currentScenario.steps[0]

  const activeComponentIds = mode === 'simulate' ? currentStep.activeComponentIds : []
  const activeWireIds = mode === 'simulate' ? currentStep.activeWireIds : []
  const busValues = mode === 'simulate' ? currentStep.busValues : {}

  const placedCount = Object.values(placedComponents).filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col bg-circuit-grid text-slate-100">
      {/* 1. Barra de Navegación Superior */}
      <Navbar
        mode={mode}
        setMode={handleModeChange}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        placedCount={placedCount}
        totalCount={COMPONENTS.length}
        onReset={handleReset}
        onAutoComplete={handleAutoComplete}
        onOpenFormats={() => setFormatsOpen(true)}
        onOpenControlTable={() => setControlTableOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        challengeTime={challengeTime}
        challengeScore={challengeScore}
      />

      {/* 2. Área Central del Lienzo del Datapath */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <DatapathCanvas
          mode={mode}
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

      {/* 3. Panel Inferior (Paleta en Modo Puzzle o Controles en Modo Simulación) */}
      <footer className="w-full shrink-0 z-30">
        {mode === 'simulate' ? (
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

      {/* 4. Modales */}
      <ComponentInspector
        component={inspectedComponent}
        onClose={() => setInspectedComponent(null)}
      />

      <InstructionFormats
        isOpen={formatsOpen}
        onClose={() => setFormatsOpen(false)}
      />

      <ControlUnitTable
        isOpen={controlTableOpen}
        onClose={() => setControlTableOpen(false)}
        onSimulateInstruction={handleSimulateInstruction}
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

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  )
}

export default App
