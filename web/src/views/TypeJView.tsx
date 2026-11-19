import React, { useState, useEffect } from 'react'
import { DatapathDiagram } from '../components/DatapathDiagram'
import {
  CornerDownRight,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Calculator,
  RefreshCw,
  Binary
} from 'lucide-react'
import { sounds } from '../utils/audio'

interface TypeJViewProps {
  theme?: 'dark' | 'light'
}

export const TypeJView: React.FC<TypeJViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light'

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const [currentPcHex, setCurrentPcHex] = useState<string>('00400014')
  const [targetIndexHex, setTargetIndexHex] = useState<string>('0010008')

  const [loopCounter, setLoopCounter] = useState<number>(0)
  const loopTarget = 3
  const [loopActiveLine, setLoopActiveLine] = useState<number>(0)
  const [isLoopRunning, setIsLoopRunning] = useState<boolean>(false)

  const currentPcNum = parseInt(currentPcHex, 16) || 0x00400000
  const pcPlus4Num = currentPcNum + 4
  const pcPlus4Hex = pcPlus4Num.toString(16).padStart(8, '0').toUpperCase()
  const top4BitsHex = pcPlus4Hex.slice(0, 1)

  const targetIndexNum = parseInt(targetIndexHex, 16) || 0
  const shiftedTargetNum = (targetIndexNum << 2) & 0x0fffffff
  const shiftedTargetHex = shiftedTargetNum.toString(16).padStart(7, '0').toUpperCase()

  const finalJumpAddrHex = `${top4BitsHex}${shiftedTargetHex}`

  const stepsData = [
    {
      num: 1,
      title: 'Paso 1: Búsqueda y Activación de Jump=1',
      short: 'La Memoria de Instrucciones entrega la instrucción de 32 bits. La Unidad de Control decodifica op=000010 y activa Jump=1.',
      activeComponents: ['pc', 'instruction_mem', 'control_unit'],
      activeWires: ['pc_to_imem', 'instr_to_ctrl', 'ctrl_jump']
    },
    {
      num: 2,
      title: 'Paso 2: Desplazamiento Shift Left 2 (26 → 28 bits)',
      short: 'El campo target de 26 bits [25:0] pasa por Shift Left (jump) que lo desplaza 2 bits a la izquierda, multiplicando por 4.',
      activeComponents: ['shift_jump'],
      activeWires: ['instr_jump_to_shift_j', 'shift_jump_out']
    },
    {
      num: 3,
      title: 'Paso 3: Concatenación con los 4 bits altos de PC+4',
      short: `Se toman los bits [31:28] de PC+4 (${top4BitsHex}) y se concatenan con los 28 bits (${shiftedTargetHex}) formando la dirección de 32 bits: 0x${finalJumpAddrHex}.`,
      activeComponents: ['adder_pc4', 'shift_jump', 'mux5'],
      activeWires: ['adder_pc4_top_bits', 'shift_jump_out']
    },
    {
      num: 4,
      title: 'Paso 4: Mux5 (Jump=1) selecciona el Salto',
      short: 'Mux5 conmuta a la entrada 1 (dirección de salto concatenada), ignorando la salida de Mux4.',
      activeComponents: ['mux5'],
      activeWires: ['ctrl_jump', 'mux5_out_to_pc']
    },
    {
      num: 5,
      title: 'Paso 5: Actualización del PC',
      short: `El registro PC se actualiza con la nueva dirección calculada (0x${finalJumpAddrHex}). En el siguiente ciclo el procesador ejecutará en el destino.`,
      activeComponents: ['pc'],
      activeWires: ['mux5_out_to_pc']
    }
  ]

  const currentStepData = stepsData[currentStep]

  useEffect(() => {
    let timer: number | null = null
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < stepsData.length - 1) {
            sounds.playPulse()
            return prev + 1
          } else {
            setIsPlaying(false)
            return 0
          }
        })
      }, 2500)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, stepsData.length])

  useEffect(() => {
    let timer: number | null = null
    if (isLoopRunning) {
      timer = window.setInterval(() => {
        setLoopActiveLine((prev) => {
          sounds.playPulse()
          if (prev === 0) {

            setLoopCounter((c) => c + 1)
            return 1
          } else if (prev === 1) {

            if (loopCounter >= loopTarget) {
              sounds.playVictory()
              setIsLoopRunning(false)
              return 3
            }
            return 2
          } else if (prev === 2) {

            return 0
          } else {
            setIsLoopRunning(false)
            return 0
          }
        })
      }, 1400)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isLoopRunning, loopCounter, loopTarget])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <CornerDownRight className="h-6 w-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Instrucción Tipo J (Salto Incondicional)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Salto Directo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Permite saltos absolutos a cualquier posición dentro del bloque actual de 256 MB combinando
            los 4 bits más significativos de PC+4 con el índice de 26 bits desplazado a 28 bits.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300">
          Next_PC = {'{'}PC+4[31:28], target[25:0] $\ll$ 2{'}'}
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-3 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Formato de Instrucción Tipo J
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-300">j target_address</span>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-center shadow-inner font-mono text-xs">
          <div className="p-3 border-r border-slate-800 bg-cyan-950/60 text-cyan-300" style={{ flex: 6 }}>
            <span className="font-bold block">op</span>
            <span className="text-[10px] opacity-70">6 bits [31:26]</span>
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">000010 (2)</span>
          </div>
          <div className="p-3 bg-purple-950/60 text-purple-300" style={{ flex: 26 }}>
            <span className="font-bold block">índice / address</span>
            <span className="text-[10px] opacity-70">26 bits [25:0]</span>
            <span className="text-[11px] font-bold text-purple-200 mt-0.5 block">
              0x{targetIndexHex} (desplazado a 28 bits: 0x{shiftedTargetHex})
            </span>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-400">
              Paso {currentStep + 1} de {stepsData.length}:
            </span>
            <h4 className="text-sm font-bold text-white">
              {currentStepData.title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick()
                setCurrentStep(0)
                setIsPlaying(false)
              }}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                sounds.playPulse()
                setCurrentStep((s) => Math.max(0, s - 1))
              }}
              disabled={currentStep === 0}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                sounds.playPulse()
                setIsPlaying(!isPlaying)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playPulse()
                setCurrentStep((s) => Math.min(stepsData.length - 1, s + 1))
              }}
              disabled={currentStep === stepsData.length - 1}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          {currentStepData.short}
        </p>

        <DatapathDiagram
          activeInstruction="j"
          activeComponentIds={currentStepData.activeComponents}
          activeWireIds={currentStepData.activeWires}
          highlightedStepNumber={currentStepData.num}
          busValues={{
            'PC actual': `0x${currentPcHex}`,
            'PC+4[31:28]': `0x${top4BitsHex}`,
            'Target<<2 (28b)': `0x${shiftedTargetHex}`,
            'Jump Target (32b)': `0x${finalJumpAddrHex}`,
            'Señal Jump': '1'
          }}
          theme={theme}
          caption="Camino Activo Tipo J · Mux5 y Shift Left (jump) iluminados"
          height="480px"
        />
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Calculadora de Dirección de Salto Incondicional
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
              PC actual (Hexadecimal)
            </label>
            <input
              type="text"
              value={currentPcHex}
              onChange={(e) => setCurrentPcHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-mono text-white"
            />
            <span className="text-[10px] text-slate-400 font-mono">
              PC + 4 = 0x{pcPlus4Hex} ➔ 4 bits superiores: <strong className="text-cyan-400">0x{top4BitsHex}</strong>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
              Campo target / índice [25:0] (Hexadecimal)
            </label>
            <input
              type="text"
              value={targetIndexHex}
              onChange={(e) => setTargetIndexHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-mono text-white"
            />
            <span className="text-[10px] text-slate-400 font-mono">
              target $\ll$ 2 = <strong className="text-purple-300">0x{shiftedTargetHex}</strong> (28 bits)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/40 space-y-2">
          <span className="text-xs font-mono text-slate-400 block font-bold">
            Concatenación Resultante (32 bits):
          </span>
          <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-extrabold flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300">
              PC+4[31:28]: 0x{top4BitsHex}
            </span>
            <span className="text-slate-500 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500 text-purple-300">
              target$\ll$2: 0x{shiftedTargetHex}
            </span>
            <span className="text-slate-500 font-bold">=</span>
            <span className="px-4 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-lg">
              0x{finalJumpAddrHex}
            </span>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Ejemplo de Bucle con `beq` y `j`
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick()
                setLoopCounter(0)
                setLoopActiveLine(0)
                setIsLoopRunning(false)
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 hover:text-white"
            >
              Reiniciar Bucle
            </button>
            <button
              onClick={() => {
                sounds.playPulse()
                setIsLoopRunning(!isLoopRunning)
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md"
            >
              {isLoopRunning ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              <span>{isLoopRunning ? 'Pausar' : 'Ejecutar Bucle'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          En este clásico patrón de compilación, <code className="text-purple-300">j loop</code> regresa incondicionalmente
          a la cabecera del bucle en cada iteración hasta que la condición evaluada por{' '}
          <code className="text-amber-300">beq $s1, $s2, exit</code> se cumple, saltando fuera del ciclo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div
              className={`p-2 rounded-lg transition-colors ${
                loopActiveLine === 0 ? 'bg-cyan-950/80 border border-cyan-500 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-cyan-400 mr-2">loop:</span>
              <span>addi $s1, $s1, 1</span>
              <span className="float-right text-[10px] text-slate-500"># Incrementa contador</span>
            </div>

            <div
              className={`p-2 rounded-lg transition-colors ${
                loopActiveLine === 1 ? 'bg-amber-950/80 border border-amber-500 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-transparent mr-2">loop:</span>
              <span>beq $s1, $s2, exit</span>
              <span className="float-right text-[10px] text-slate-500"># ¿Contador == Límite?</span>
            </div>

            <div
              className={`p-2 rounded-lg transition-colors ${
                loopActiveLine === 2 ? 'bg-purple-950/80 border border-purple-500 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-transparent mr-2">loop:</span>
              <span className="text-purple-300">j loop</span>
              <span className="float-right text-[10px] text-slate-500"># Salto incondicional al inicio</span>
            </div>

            <div
              className={`p-2 rounded-lg transition-colors ${
                loopActiveLine === 3 ? 'bg-emerald-950/80 border border-emerald-500 text-white font-bold' : 'text-slate-500'
              }`}
            >
              <span className="text-emerald-400 mr-2">exit:</span>
              <span>add $t0, $s1, $zero</span>
              <span className="float-right text-[10px] text-slate-500"># Fin del ciclo</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 font-mono text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Contador ($s1):</span>
                <span className="text-base font-bold text-cyan-400">{loopCounter}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Límite para salir ($s2):</span>
                <span className="text-base font-bold text-amber-400">{loopTarget}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              {loopCounter >= loopTarget ? (
                <span className="text-emerald-400 font-bold">
                  ¡Bucle completado! beq detectó $s1 == $s2 ({loopCounter}) y saltó a `exit`.
                </span>
              ) : (
                <span className="text-purple-300">
                  Iterando... j loop regresa el PC a la cabecera.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
