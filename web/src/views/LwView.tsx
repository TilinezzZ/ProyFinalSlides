import React, { useState, useEffect } from 'react'
import { DatapathDiagram } from '../components/DatapathDiagram'
import { INITIAL_LW_REGISTERS, INITIAL_LW_MEMORY, type RegisterEntry, type MemoryEntry } from '../data/slide26Data'
import { DiscrepancyNotice } from '../components/DiscrepancyNotice'
import {
  Database,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Table,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react'
import { sounds } from '../utils/audio'

interface LwViewProps {
  theme?: 'dark' | 'light'
}

export const LwView: React.FC<LwViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light'

  const [operationMode, setOperationMode] = useState<'lw' | 'sw'>('lw')

  const [registers, setRegisters] = useState<RegisterEntry[]>(INITIAL_LW_REGISTERS)
  const [memory, setMemory] = useState<MemoryEntry[]>(INITIAL_LW_MEMORY)

  const [selectedRs, setSelectedRs] = useState<number>(16)
  const [selectedRt, setSelectedRt] = useState<number>(8)
  const [offset, setOffset] = useState<number>(2)

  const [highlightedReg, setHighlightedReg] = useState<number | null>(null)
  const [highlightedMemAddr, setHighlightedMemAddr] = useState<number | null>(null)

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const baseRegEntry = registers.find((r) => r.regNumber === selectedRs) || registers[0]
  const baseValue = baseRegEntry.value
  const computedAddress = baseValue + offset

  const memoryEntry = memory.find((m) => m.address === computedAddress)
  const memValue = memoryEntry ? memoryEntry.value : 0

  const lwSteps = [
    {
      num: 1,
      title: 'Paso 1: Extensión de Signo del Offset',
      short: `El offset de 16 bits (${offset}) pasa por Sign Ext para convertirse a 32 bits (0x0000000${offset}).`,
      activeComponents: ['pc', 'instruction_mem', 'sign_ext'],
      activeWires: ['instr_imm_to_sign_ext', 'sign_ext_to_mux3']
    },
    {
      num: 2,
      title: 'Paso 2: Mux3 (ALUSrc=1) elige el Inmediato',
      short: 'Mux3 selecciona el offset extendido hacia la entrada B de la ALU. La entrada DR2 queda atenuada.',
      activeComponents: ['mux3', 'register_file'],
      activeWires: ['rf_dr1_to_alu', 'sign_ext_to_mux3', 'ctrl_alu_src', 'mux3_out']
    },
    {
      num: 3,
      title: 'Paso 3: Cálculo de Dirección Efectiva en la ALU',
      short: `ALU Control emite 0010 (ADD). La ALU suma base (${baseValue}) + offset (${offset}) = Dirección ${computedAddress}.`,
      activeComponents: ['alu_control', 'alu'],
      activeWires: ['alu_ctrl_out', 'alu_out_to_dmem']
    },
    {
      num: 4,
      title: 'Paso 4: Lectura en Memoria de Datos (MemRead=1)',
      short: `MemRead=1 habilita la lectura en la dirección ${computedAddress}. La memoria entrega el dato almacenado (${memValue}).`,
      activeComponents: ['data_mem'],
      activeWires: ['alu_out_to_dmem', 'ctrl_mem_read', 'dmem_out_to_mux1']
    },
    {
      num: 5,
      title: 'Paso 5: Mux1 (MemtoReg=1) y Escritura en $rt (RegWrite=1)',
      short: `Mux1 selecciona el dato de memoria (${memValue}). Como RegDst=0, Mux2 selecciona rt ($${selectedRt}) y se escribe el dato con RegWrite=1.`,
      activeComponents: ['mux1', 'mux2', 'register_file'],
      activeWires: ['ctrl_mem_to_reg', 'mux1_out_to_dw', 'ctrl_en_br', 'mux2_out']
    }
  ]

  const swSteps = [
    {
      num: 1,
      title: 'Paso 1: Lectura de Registro $rt y Extensión de Offset',
      short: `El registro fuente $rt ($${selectedRt}) se lee en DR2. Simultáneamente Sign Ext extiende el offset ${offset}.`,
      activeComponents: ['register_file', 'sign_ext'],
      activeWires: ['instr_rt_to_rf', 'rf_dr2_to_dmem', 'instr_imm_to_sign_ext']
    },
    {
      num: 2,
      title: 'Paso 2: Cálculo de Dirección de Almacenamiento en ALU',
      short: `ALUSrc=1 hace que la ALU sume base (${baseValue}) + offset (${offset}) = Dirección ${computedAddress}.`,
      activeComponents: ['mux3', 'alu'],
      activeWires: ['rf_dr1_to_alu', 'sign_ext_to_mux3', 'mux3_out', 'alu_out_to_dmem']
    },
    {
      num: 3,
      title: 'Paso 3: Escritura en Memoria de Datos (MemWrite=1)',
      short: `MemWrite=1 guarda el dato de DR2 en la posición de memoria ${computedAddress}. RegWrite=0 (no se altera ningún registro).`,
      activeComponents: ['data_mem'],
      activeWires: ['alu_out_to_dmem', 'rf_dr2_to_dmem', 'ctrl_mem_write']
    }
  ]

  const currentStepsList = operationMode === 'lw' ? lwSteps : swSteps
  const currentStepData = currentStepsList[currentStep] || currentStepsList[0]

  const handleExecuteTransfer = () => {
    sounds.playSnap()
    if (operationMode === 'lw') {

      setHighlightedMemAddr(computedAddress)
      setTimeout(() => {
        setRegisters((prev) =>
          prev.map((r) => (r.regNumber === selectedRt ? { ...r, value: memValue } : r))
        )
        setHighlightedReg(selectedRt)
        sounds.playVictory()
      }, 500)
    } else {

      const rtEntry = registers.find((r) => r.regNumber === selectedRt)
      const dataToStore = rtEntry ? rtEntry.value : 0
      setHighlightedReg(selectedRt)
      setTimeout(() => {
        setMemory((prev) =>
          prev.map((m) => (m.address === computedAddress ? { ...m, value: dataToStore } : m))
        )
        setHighlightedMemAddr(computedAddress)
        sounds.playVictory()
      }, 500)
    }
  }

  const handleResetTables = () => {
    sounds.playClick()
    setRegisters(INITIAL_LW_REGISTERS)
    setMemory(INITIAL_LW_MEMORY)
    setHighlightedReg(null)
    setHighlightedMemAddr(null)
  }

  useEffect(() => {
    let timer: number | null = null
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < currentStepsList.length - 1) {
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
  }, [isPlaying, currentStepsList.length])

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400">
              <Database className="h-6 w-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              {operationMode === 'lw' ? 'Instrucción LW (Load Word)' : 'Instrucción SW (Store Word)'}
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Transferencia de Memoria
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {operationMode === 'lw'
              ? 'Transfiere una palabra de 32 bits desde la Memoria de Datos hacia un registro del procesador: GPR[rt] ← memory[GPR[rs] + offset].'
              : 'Transfiere el contenido de un registro hacia una posición de memoria: memory[GPR[rs] + offset] ← GPR[rt].'}
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              sounds.playClick()
              setOperationMode('lw')
              setCurrentStep(0)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
              operationMode === 'lw'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>LW (Load)</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick()
              setOperationMode('sw')
              setCurrentStep(0)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
              operationMode === 'sw'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>SW (Store)</span>
          </button>
        </div>
      </div>

      {operationMode === 'sw' && (
        <DiscrepancyNotice filterId="sw_semantics_slide27" />
      )}

      <div className={`p-4 rounded-xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } flex flex-wrap items-center justify-between gap-3 text-xs font-mono`}>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Sintaxis:</span>
          <span className="text-sm font-bold text-white bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {operationMode === 'lw' ? `lw $t0, ${offset}($s0)` : `sw $t0, ${offset}($s0)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1">Señales:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            RegDst={operationMode === 'lw' ? '0' : 'X'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            ALUSrc=1
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            MemtoReg={operationMode === 'lw' ? '1' : 'X'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
            RegWrite={operationMode === 'lw' ? '1' : '0'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400 font-bold">
            MemRead={operationMode === 'lw' ? '1' : '0'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-400 font-bold">
            MemWrite={operationMode === 'lw' ? '0' : '1'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
            ALUOp=00 (ADD)
          </span>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
              Paso {currentStep + 1} de {currentStepsList.length}:
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
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playPulse()
                setCurrentStep((s) => Math.min(currentStepsList.length - 1, s + 1))
              }}
              disabled={currentStep === currentStepsList.length - 1}
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
          activeInstruction={operationMode}
          activeComponentIds={currentStepData.activeComponents}
          activeWireIds={currentStepData.activeWires}
          highlightedStepNumber={currentStepData.num}
          busValues={{
            'Base $rs': `${baseValue}`,
            'Offset': `${offset}`,
            'Dirección (ALU)': `${computedAddress}`,
            'Dato Memoria': `${memValue}`,
            'Destino AW': `$${selectedRt}`
          }}
          theme={theme}
          caption={`Camino Activo ${operationMode.toUpperCase()} · Memoria de Datos en uso`}
          height="480px"
        />
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Tablas de Estado de Registros y Memoria
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTables}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              Restablecer Valores Iniciales
            </button>
            <button
              onClick={handleExecuteTransfer}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-md transition-all ${
                operationMode === 'lw'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <span>{operationMode === 'lw' ? 'Cargar (Memoria → $rt)' : 'Guardar ($rt → Memoria)'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Registro Base $rs:</label>
            <select
              value={selectedRs}
              onChange={(e) => setSelectedRs(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
            >
              {registers.map((r) => (
                <option key={r.regNumber} value={r.regNumber}>
                  {r.regName} (${r.regNumber}) = {r.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Desplazamiento (Offset):</label>
            <input
              type="number"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Registro Objetivo $rt:</label>
            <select
              value={selectedRt}
              onChange={(e) => setSelectedRt(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
            >
              {registers.map((r) => (
                <option key={r.regNumber} value={r.regNumber}>
                  {r.regName} (${r.regNumber}) = {r.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 font-mono text-center">
          Dirección Efectiva = GPR[{selectedRs}] ({baseValue}) + {offset} = <strong className="text-white font-bold">{computedAddress}</strong>
          {memoryEntry ? (
            <span className="ml-2 text-emerald-400">➔ Valor en RAM = {memoryEntry.value}</span>
          ) : (
            <span className="ml-2 text-amber-400">➔ Dirección fuera del rango [20..30]</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Banco de Registros (Direcciones 7 a 17)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">GPR[]</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs max-h-64 overflow-y-auto pr-1">
              {registers.map((reg) => {
                const isTarget = highlightedReg === reg.regNumber
                const isRs = selectedRs === reg.regNumber
                const isRt = selectedRt === reg.regNumber

                return (
                  <div
                    key={reg.regNumber}
                    className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                      isTarget
                        ? 'bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-500/50 font-bold'
                        : isRs
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                        : isRt
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white mr-1.5">{reg.regName}</span>
                      <span className="text-[10px] opacity-60">(${reg.regNumber})</span>
                    </div>
                    <span className="text-cyan-400 font-extrabold">{reg.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Memoria de Datos (Direcciones 20 a 30)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">RAM[]</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs max-h-64 overflow-y-auto pr-1">
              {memory.map((mem) => {
                const isTarget = highlightedMemAddr === mem.address
                const isAddressComputed = computedAddress === mem.address

                return (
                  <div
                    key={mem.address}
                    className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                      isTarget
                        ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-500/50 font-bold'
                        : isAddressComputed
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white mr-1.5">Dir [{mem.address}]</span>
                    </div>
                    <span className="text-amber-400 font-extrabold">{mem.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
