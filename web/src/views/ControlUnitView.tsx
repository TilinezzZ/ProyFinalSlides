import React, { useState } from 'react'
import {
  CONTROL_SIGNALS_INFO,
  CONTROL_SIGNALS_MATRIX,
  TRUTH_TABLE_OPCODES,
  ALU_CONTROL_TABLE,
  CONTROL_UNIT_QUIZ,
  type SignalTooltip
} from '../data/controlSignals'
import { DiscrepancyNotice } from '../components/DiscrepancyNotice'
import {
  Cpu,
  Table2,
  Binary,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react'
import { sounds } from '../utils/audio'

interface ControlUnitViewProps {
  theme?: 'dark' | 'light'
}

export const ControlUnitView: React.FC<ControlUnitViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light'

  const [selectedInstruction, setSelectedInstruction] = useState<string>('R-format')

  const [selectedSignal, setSelectedSignal] = useState<string>('RegDst')

  const [decoderBits, setDecoderBits] = useState<string[]>(['0', '0', '0', '0', '0', '0'])

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({})

  const currentOpcode = decoderBits.join('')
  const matchedTruthRow = TRUTH_TABLE_OPCODES.find(
    (row) =>
      `${row.op5}${row.op4}${row.op3}${row.op2}${row.op1}${row.op0}` === currentOpcode
  )

  const selectedMatrixRow =
    CONTROL_SIGNALS_MATRIX.find((r) => r.instruction === selectedInstruction) ||
    CONTROL_SIGNALS_MATRIX[0]

  const activeSignalTooltip: SignalTooltip =
    CONTROL_SIGNALS_INFO[selectedSignal] || CONTROL_SIGNALS_INFO['RegDst']

  const handleToggleDecoderBit = (index: number) => {
    sounds.playClick()
    setDecoderBits((prev) => {
      const next = [...prev]
      next[index] = next[index] === '0' ? '1' : '0'
      return next
    })
  }

  const handleQuizSelect = (questionId: number, optionIndex: number) => {
    sounds.playClick()
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }))
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Cpu className="h-6 w-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Unidad de Control
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Decodificador Principal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Decodificador central combinacional que interpreta el opcode [31:26] de la instrucción
            y emite las 9 señales que orquestan el flujo de datos en el datapath.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 px-2 font-bold">Instrucción:</span>
          {CONTROL_SIGNALS_MATRIX.map((row) => (
            <button
              key={row.instruction}
              onClick={() => {
                sounds.playClick()
                setSelectedInstruction(row.instruction)
              }}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                selectedInstruction === row.instruction
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {row.instruction}
            </button>
          ))}
        </div>
      </div>

      <DiscrepancyNotice />

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Diagrama de Bloque RTL de la Unidad de Control
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Haz clic en cualquier señal para ver su función detallada
          </span>
        </div>

        <div className="w-full flex justify-center py-2 overflow-x-auto">
          <svg viewBox="0 0 760 320" className="w-full max-w-3xl h-auto select-none">

            <line x1="40" y1="160" x2="200" y2="160" stroke="#00f0ff" strokeWidth="3" />
            <polygon points="195,155 205,160 195,165" fill="#00f0ff" />
            <text x="110" y="145" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              Op [31:26]
            </text>
            <text x="110" y="175" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
              6 bits ({selectedMatrixRow.opcode})
            </text>

            <rect
              x="200"
              y="20"
              width="240"
              height="280"
              rx="16"
              fill={isLight ? '#f1f5f9' : '#0a192f'}
              stroke="#0284c7"
              strokeWidth="2.5"
              filter="drop-shadow(0 0 12px rgba(2, 132, 199, 0.25))"
            />
            <text x="320" y="60" fill="#f8fafc" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              UNIDAD DE CONTROL
            </text>
            <text x="320" y="80" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Control Unit RTL
            </text>

            {[
              { id: 'RegDst', y: 70, val: selectedMatrixRow.regDst },
              { id: 'Branch', y: 95, val: selectedMatrixRow.branch },
              { id: 'MemRead', y: 120, val: selectedMatrixRow.memRead },
              { id: 'MemtoReg', y: 145, val: selectedMatrixRow.memToReg },
              { id: 'ALUOp', y: 170, val: `${selectedMatrixRow.aluOp1}${selectedMatrixRow.aluOp0}` },
              { id: 'MemWrite', y: 195, val: selectedMatrixRow.memWrite },
              { id: 'ALUSrc', y: 220, val: selectedMatrixRow.aluSrc },
              { id: 'RegWrite', y: 245, val: selectedMatrixRow.regWrite, extraLabel: ' (en_BR)' },
              { id: 'Jump', y: 270, val: selectedMatrixRow.jump }
            ].map((sig) => {
              const isSelected = selectedSignal === sig.id
              const isValOne = sig.val === '1' || sig.val === '10' || sig.val === '01'

              return (
                <g
                  key={sig.id}
                  onClick={() => {
                    sounds.playClick()
                    setSelectedSignal(sig.id)
                  }}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                >

                  <line
                    x1="440"
                    y1={sig.y}
                    x2="600"
                    y2={sig.y}
                    stroke={isSelected ? '#00f0ff' : isValOne ? '#38bdf8' : '#475569'}
                    strokeWidth={isSelected ? '3' : isValOne ? '2' : '1.2'}
                  />
                  <polygon
                    points={`595,${sig.y - 4} 605,${sig.y} 595,${sig.y + 4}`}
                    fill={isSelected ? '#00f0ff' : isValOne ? '#38bdf8' : '#475569'}
                  />

                  <rect
                    x="455"
                    y={sig.y - 10}
                    width="135"
                    height="20"
                    rx="4"
                    fill={isSelected ? '#0369a1' : isValOne ? '#082f49' : isLight ? '#e2e8f0' : '#0f172a'}
                    stroke={isSelected ? '#00f0ff' : isValOne ? '#0284c7' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="465"
                    y={sig.y + 4}
                    fill={isSelected ? '#ffffff' : isValOne ? '#38bdf8' : '#94a3b8'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {sig.id}
                    {sig.extraLabel && <tspan fontSize="9" opacity="0.8">{sig.extraLabel}</tspan>}
                  </text>
                  <text
                    x="580"
                    y={sig.y + 4}
                    fill={isValOne ? '#4ade80' : sig.val === 'X' ? '#f59e0b' : '#64748b'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {sig.val}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                {activeSignalTooltip.name} ({activeSignalTooltip.bitWidth})
              </span>
              <span className="text-xs font-bold text-white">
                {activeSignalTooltip.fullName}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Llega a: <strong className="text-cyan-300">{activeSignalTooltip.destination}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-300">{activeSignalTooltip.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 font-mono">Cuando vale 0: </span>
              <span className="text-slate-300">{activeSignalTooltip.whenZero}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-400 font-mono">Cuando vale 1: </span>
              <span className="text-slate-300">{activeSignalTooltip.whenOne}</span>
            </div>
          </div>

          {activeSignalTooltip.discrepancyNote && (
            <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 font-mono">
              📌 {activeSignalTooltip.discrepancyNote}
            </p>
          )}
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-3 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Tabla de Señales de Control
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Valores: 0, 1 y X (Don't Care)</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Instrucción</th>
                <th className="px-3 py-3 text-center">RegDst</th>
                <th className="px-3 py-3 text-center">ALUSrc</th>
                <th className="px-3 py-3 text-center">MemtoReg</th>
                <th className="px-3 py-3 text-center text-cyan-400 font-bold">
                  RegWrite <span className="text-[9px] text-slate-400 font-normal">(en_BR)</span>
                </th>
                <th className="px-3 py-3 text-center">MemRead</th>
                <th className="px-3 py-3 text-center">MemWrite</th>
                <th className="px-3 py-3 text-center">Branch</th>
                <th className="px-3 py-3 text-center text-amber-400">ALUOp1</th>
                <th className="px-3 py-3 text-center text-amber-400">ALUOp0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {CONTROL_SIGNALS_MATRIX.map((row) => {
                const isSelected = selectedInstruction === row.instruction
                return (
                  <tr
                    key={row.instruction}
                    onClick={() => {
                      sounds.playClick()
                      setSelectedInstruction(row.instruction)
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 font-bold text-white'
                        : 'bg-slate-900/30 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? 'text-cyan-300' : 'text-slate-200'}>
                          {row.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {row.opcode}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">{row.regDst}</td>
                    <td className="px-3 py-3 text-center font-bold">{row.aluSrc}</td>
                    <td className="px-3 py-3 text-center font-bold">{row.memToReg}</td>
                    <td className="px-3 py-3 text-center font-bold text-cyan-400">{row.regWrite}</td>
                    <td className="px-3 py-3 text-center font-bold">{row.memRead}</td>
                    <td className="px-3 py-3 text-center font-bold">{row.memWrite}</td>
                    <td className="px-3 py-3 text-center font-bold">{row.branch}</td>
                    <td className="px-3 py-3 text-center font-bold text-amber-400">{row.aluOp1}</td>
                    <td className="px-3 py-3 text-center font-bold text-amber-400">{row.aluOp0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Tabla de Verdad de Opcodes y Modo Decodificador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de Verdad con Opcode */}
        <div className={`p-5 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        } space-y-3 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Binary className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Tabla de Verdad con Opcode
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-2.5 py-2">Instrucción</th>
                  <th className="px-1.5 py-2 text-center text-cyan-400">Op5..Op0</th>
                  <th className="px-1.5 py-2 text-center">RegDst</th>
                  <th className="px-1.5 py-2 text-center">ALUSrc</th>
                  <th className="px-1.5 py-2 text-center">MemToReg</th>
                  <th className="px-1.5 py-2 text-center">RegWrite</th>
                  <th className="px-1.5 py-2 text-center">MemRead</th>
                  <th className="px-1.5 py-2 text-center">MemWrite</th>
                  <th className="px-1.5 py-2 text-center">Branch</th>
                  <th className="px-1.5 py-2 text-center text-amber-400">ALUOp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {TRUTH_TABLE_OPCODES.map((row) => (
                  <tr key={row.instruction} className="bg-slate-900/30 hover:bg-slate-850">
                    <td className="px-2.5 py-2 font-bold text-white">{row.instruction}</td>
                    <td className="px-1.5 py-2 text-center font-bold text-cyan-300">
                      {row.op5}{row.op4}{row.op3}{row.op2}{row.op1}{row.op0}
                    </td>
                    <td className="px-1.5 py-2 text-center">{row.regDst}</td>
                    <td className="px-1.5 py-2 text-center">{row.aluSrc}</td>
                    <td className="px-1.5 py-2 text-center">{row.memToReg}</td>
                    <td className="px-1.5 py-2 text-center font-bold text-cyan-400">{row.regWrite}</td>
                    <td className="px-1.5 py-2 text-center">{row.memRead}</td>
                    <td className="px-1.5 py-2 text-center">{row.memWrite}</td>
                    <td className="px-1.5 py-2 text-center">{row.branch}</td>
                    <td className="px-1.5 py-2 text-center text-amber-300 font-bold">{row.aluOp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODO DECODIFICADOR INTERACTIVO */}
        <div className={`p-5 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        } space-y-4 shadow-xl flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Modo Decodificador Interactivo
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Haz clic en cada bit para alternar entre 0 y 1 y observa cómo la Unidad de Control identifica la instrucción.
            </p>
          </div>

          {/* Selector de los 6 bits */}
          <div className="flex items-center justify-center gap-2 py-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            {decoderBits.map((bit, idx) => (
              <button
                key={idx}
                onClick={() => handleToggleDecoderBit(idx)}
                className={`flex flex-col items-center justify-center w-11 h-14 rounded-xl font-mono border transition-all ${
                  bit === '1'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
                }`}
                title={`Bit Op${5 - idx}`}
              >
                <span className="text-[10px] text-slate-400 font-sans">Op{5 - idx}</span>
                <span className="text-lg font-extrabold">{bit}</span>
              </button>
            ))}
          </div>

          {/* Resultado de la decodificación */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-800/40">
            {matchedTruthRow ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Instrucción Detectada:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {matchedTruthRow.instruction} (Opcode {currentOpcode})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] font-mono pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    RegDst={matchedTruthRow.regDst}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    ALUSrc={matchedTruthRow.aluSrc}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    MemtoReg={matchedTruthRow.memToReg}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                    RegWrite={matchedTruthRow.regWrite}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold">
                    ALUOp={matchedTruthRow.aluOp}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
                <XCircle className="h-4 w-4" />
                <span>Opcode {currentOpcode} no coincide con R-format, lw, sw, beq ni j.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Tabla de ALU Control (4 bits) */}
      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-3 shadow-xl`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Tabla de ALU Control (Códigos de 4 bits)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            Control de 4 bits: 0010 (add), 0110 (sub), 0000 (AND), 0001 (OR), 0111 (slt)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Instrucción</th>
                <th className="px-3 py-2.5 text-center text-amber-400">ALUOp</th>
                <th className="px-3 py-2.5 text-center">funct [5:0]</th>
                <th className="px-3 py-2.5 text-center">Acción ALU</th>
                <th className="px-3 py-2.5 text-center text-purple-300 font-bold">Control (4 bits)</th>
                <th className="px-3 py-2.5 text-center text-slate-400">Control (3 bits RTL)</th>
                <th className="px-4 py-2.5">Descripción de la Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ALU_CONTROL_TABLE.map((row) => (
                <tr key={`${row.instruction}-${row.funct}`} className="bg-slate-900/30 hover:bg-slate-850">
                  <td className="px-4 py-2.5 font-bold text-white">{row.instruction}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-amber-400">{row.aluOp}</td>
                  <td className="px-3 py-2.5 text-center text-slate-300">{row.funct}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-cyan-300">{row.action}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-purple-300 bg-purple-950/30">
                    {row.aluControl4Bit}
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-400">{row.aluControl3BitRTL}</td>
                  <td className="px-4 py-2.5 text-slate-300">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Mini-Quiz de Autoevaluación de la Unidad de Control */}
      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-4 shadow-xl`}>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">
            Mini-Quiz: Autoevaluación de Señales de Control
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTROL_UNIT_QUIZ.map((q) => {
            const selectedOpt = quizAnswers[q.id]
            const isSubmitted = quizSubmitted[q.id]

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    Pregunta {q.id}
                  </span>
                  <p className="text-xs font-semibold text-slate-200 mt-1">{q.question}</p>
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx
                    const showCorrect = isSubmitted && opt.correct
                    const showIncorrect = isSubmitted && isSelected && !opt.correct

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizSelect(q.id, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-sans border transition-all flex items-center justify-between ${
                          showCorrect
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                            : showIncorrect
                            ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                            : isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <span>
                          <strong className="font-mono text-cyan-400 mr-2">{opt.label})</strong>
                          {opt.text}
                        </span>
                        {showCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                        {showIncorrect && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {isSubmitted && (
                  <p className="text-[11px] text-cyan-300/90 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
