import React, { useState, useEffect } from 'react'
import { DatapathDiagram } from '../components/DatapathDiagram'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Binary,
  Layers,
  Calculator,
  CheckCircle2
} from 'lucide-react'
import { sounds } from '../utils/audio'

interface TypeRViewProps {
  theme?: 'dark' | 'light'
}

export const TypeRView: React.FC<TypeRViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light'

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const [rsValue, setRsValue] = useState<number>(25)
  const [rtValue, setRtValue] = useState<number>(15)
  const [selectedFunct, setSelectedFunct] = useState<string>('add')

  const functOptions = [
    { id: 'add', name: 'add (Suma)', bin: '100000', op: (a: number, b: number) => a + b, symbol: '+' },
    { id: 'sub', name: 'sub (Resta)', bin: '100010', op: (a: number, b: number) => a - b, symbol: '-' },
    { id: 'and', name: 'and (AND lógico)', bin: '100100', op: (a: number, b: number) => a & b, symbol: '&' },
    { id: 'or', name: 'or (OR lógico)', bin: '100101', op: (a: number, b: number) => a | b, symbol: '|' },
    { id: 'slt', name: 'slt (Set on Less Than)', bin: '101010', op: (a: number, b: number) => (a < b ? 1 : 0), symbol: '<' }
  ]

  const currentFunctObj = functOptions.find((f) => f.id === selectedFunct) || functOptions[0]
  const calculatedResult = currentFunctObj.op(rsValue, rtValue)

  const stepsData: {
    num: number
    title: string
    short: string
    activeComponents: string[]
    activeWires: string[]
    busValues: Record<string, string>
  }[] = [
    {
      num: 1,
      title: 'Paso 1: Búsqueda y PC+4',
      short: 'PC entrega dirección y PC+4 se calcula en paralelo.',
      activeComponents: ['pc', 'adder_pc4'],
      activeWires: ['pc_to_imem', 'pc_to_adder_pc4', 'adder_pc4_out', 'adder_pc4_to_mux4'],
      busValues: {
        'PC': '0x00400000',
        'PC+4': '0x00400004',
        'Operación': 'Fetch simultáneo'
      }
    },
    {
      num: 2,
      title: 'Paso 2: Lectura de Memoria de Instrucciones',
      short: 'La Memoria de Instrucciones entrega los 32 bits de la palabra.',
      activeComponents: ['instruction_mem'],
      activeWires: ['imem_out', 'instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf', 'instr_rd_to_mux2'],
      busValues: {
        'Instrucción': `0x02324020 (${selectedFunct})`,
        'op': '000000',
        'rs [25:21]': '17 ($s1)',
        'rt [20:16]': '18 ($s2)',
        'rd [15:11]': '8 ($t0)'
      }
    },
    {
      num: 3,
      title: 'Paso 3: Decodificación en Unidad de Control',
      short: 'La Unidad de Control decodifica op=000000 y activa sus señales.',
      activeComponents: ['control_unit'],
      activeWires: ['ctrl_regdst', 'ctrl_en_br', 'ctrl_alu_src', 'ctrl_alu_op', 'ctrl_mem_to_reg'],
      busValues: {
        'RegDst': '1',
        'ALUSrc': '0',
        'MemtoReg': '0',
        'RegWrite (en_BR)': '1',
        'ALUOp': '10'
      }
    },
    {
      num: 4,
      title: 'Paso 4: Lectura en Banco de Registros',
      short: 'El Banco de Registros lee rs y rt (AR1, AR2) y entrega DR1 y DR2.',
      activeComponents: ['register_file'],
      activeWires: ['rf_dr1_to_alu', 'rf_dr2_to_mux3'],
      busValues: {
        'AR1': '17 ($s1)',
        'AR2': '18 ($s2)',
        'DR1': `${rsValue}`,
        'DR2': `${rtValue}`
      }
    },
    {
      num: 5,
      title: 'Paso 5: Mux2 (RegDst=1) elige rd',
      short: 'Mux2 (RegDst=1) elige rd como registro destino para AW.',
      activeComponents: ['mux2', 'register_file'],
      activeWires: ['instr_rd_to_mux2', 'ctrl_regdst', 'mux2_out'],
      busValues: {
        'RegDst': '1',
        'Entrada 1 (rd)': '8 ($t0)',
        'Salida AW': '8 ($t0)'
      }
    },
    {
      num: 6,
      title: 'Paso 6: Mux3 (ALUSrc=0) elige DR2',
      short: 'Mux3 (ALUSrc=0) elige DR2 como segundo operando de la ALU.',
      activeComponents: ['mux3'],
      activeWires: ['rf_dr2_to_mux3', 'ctrl_alu_src', 'mux3_out'],
      busValues: {
        'ALUSrc': '0',
        'Entrada 0 (DR2)': `${rtValue}`,
        'ALU Entrada B': `${rtValue}`
      }
    },
    {
      num: 7,
      title: 'Paso 7: Operación en ALU Control y ALU',
      short: 'ALU Control combina ALUOp=10 con funct y la ALU opera.',
      activeComponents: ['alu_control', 'alu'],
      activeWires: ['instr_funct_to_alu_ctrl', 'ctrl_alu_op', 'alu_ctrl_out', 'rf_dr1_to_alu', 'mux3_out', 'alu_out_to_mux1'],
      busValues: {
        'ALUOp': '10',
        'funct': `${currentFunctObj.bin} (${selectedFunct})`,
        'ALU Control': '0010 (4 bits)',
        'Resultado ALU': `${calculatedResult}`,
        'zf': calculatedResult === 0 ? '1' : '0'
      }
    },
    {
      num: 8,
      title: 'Paso 8: Mux1 y Escritura en Registro (RegWrite=1)',
      short: 'Mux1 (MemtoReg=0) lleva el resultado de la ALU a DW y se escribe en rd (RegWrite=1 / en_BR=1).',
      activeComponents: ['mux1', 'register_file'],
      activeWires: ['alu_out_to_mux1', 'ctrl_mem_to_reg', 'mux1_out_to_dw', 'ctrl_en_br'],
      busValues: {
        'MemtoReg': '0',
        'DW': `${calculatedResult}`,
        'AW': '8 ($t0)',
        'RegWrite': '1'
      }
    },
    {
      num: 9,
      title: 'Paso 9: Mux4 elige PC+4 y actualiza PC',
      short: 'Mux4 elige PC+4 (Branch=0) y se actualiza el PC para el siguiente ciclo.',
      activeComponents: ['mux4', 'mux5', 'pc'],
      activeWires: ['adder_pc4_to_mux4', 'mux4_out_to_mux5', 'mux5_out_to_pc'],
      busValues: {
        'Branch': '0',
        'PCSrc': '0',
        'Jump': '0',
        'Next PC': '0x00400004'
      }
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
      }, 2400)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, stepsData.length])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Layers className="h-6 w-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Instrucción Tipo R (Registro)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Operación Registro-Registro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Opera exclusivamente entre registros internos del procesador. El camino activo resalta
            la lectura de dos operandos, la ejecución en la ALU y la escritura en el registro destino.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40 text-cyan-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Memoria de Datos atenuada (no se accede a RAM)</span>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-3 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Formato de Instrucción Tipo R (Campos y Rangos de Bits)
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">add $rd, $rs, $rt</span>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-center shadow-inner font-mono text-xs">
          <div className="p-2.5 border-r border-slate-800 bg-cyan-950/50 text-cyan-300" style={{ flex: 6 }}>
            <span className="font-bold block">op</span>
            <span className="text-[10px] opacity-70">6 bits [31:26]</span>
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">000000</span>
          </div>
          <div className="p-2.5 border-r border-slate-800 bg-emerald-950/50 text-emerald-300" style={{ flex: 5 }}>
            <span className="font-bold block">rs</span>
            <span className="text-[10px] opacity-70">5 bits [25:21]</span>
            <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">10001 (17)</span>
          </div>
          <div className="p-2.5 border-r border-slate-800 bg-blue-950/50 text-blue-300" style={{ flex: 5 }}>
            <span className="font-bold block">rt</span>
            <span className="text-[10px] opacity-70">5 bits [20:16]</span>
            <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">10010 (18)</span>
          </div>
          <div className="p-2.5 border-r border-slate-800 bg-amber-950/50 text-amber-300" style={{ flex: 5 }}>
            <span className="font-bold block">rd</span>
            <span className="text-[10px] opacity-70">5 bits [15:11]</span>
            <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">01000 (8)</span>
          </div>
          <div className="p-2.5 border-r border-slate-800 bg-purple-950/50 text-purple-300" style={{ flex: 5 }}>
            <span className="font-bold block">shamt</span>
            <span className="text-[10px] opacity-70">5 bits [10:6]</span>
            <span className="text-[11px] font-bold text-slate-200 mt-0.5 block">00000 (0)</span>
          </div>
          <div className="p-2.5 bg-pink-950/50 text-pink-300" style={{ flex: 6 }}>
            <span className="font-bold block">funct</span>
            <span className="text-[10px] opacity-70">6 bits [5:0]</span>
            <span className="text-[11px] font-bold text-pink-400 mt-0.5 block">{currentFunctObj.bin}</span>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
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
              title="Reiniciar al paso 1"
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
              title="Paso anterior"
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
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
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
              title="Siguiente paso"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          {currentStepData.short}
        </p>

        <DatapathDiagram
          activeInstruction="R"
          activeComponentIds={currentStepData.activeComponents}
          activeWireIds={currentStepData.activeWires}
          highlightedStepNumber={currentStepData.num}
          busValues={currentStepData.busValues}
          theme={theme}
          caption={`Flujo Tipo R · ${currentStepData.title}`}
          height="500px"
        />
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
            Calculadora Interactiva de Operandos Tipo R
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Modifica los operandos de los registros rs y rt, elige la función y comprueba el cálculo en tiempo real:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Operando A ($rs / DR1)
            </label>
            <input
              type="number"
              value={rsValue}
              onChange={(e) => setRsValue(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
              Operación (funct)
            </label>
            <select
              value={selectedFunct}
              onChange={(e) => {
                sounds.playClick()
                setSelectedFunct(e.target.value)
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              {functOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <label className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
              Operando B ($rt / DR2)
            </label>
            <input
              type="number"
              value={rtValue}
              onChange={(e) => setRtValue(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800 space-y-1 flex flex-col justify-center">
            <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold">
              Resultado en $rd (DW)
            </span>
            <div className="text-lg font-mono font-extrabold text-cyan-400">
              {calculatedResult}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {rsValue} {currentFunctObj.symbol} {rtValue} = {calculatedResult}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
