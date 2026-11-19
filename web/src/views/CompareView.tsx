import React, { useState } from 'react'
import { DatapathDiagram } from '../components/DatapathDiagram'
import { CONTROL_SIGNALS_MATRIX, type ControlMatrixRow } from '../data/controlSignals'
import { ArrowLeftRight, Check, X, Layers, Cpu } from 'lucide-react'
import { sounds } from '../utils/audio'

interface CompareViewProps {
  theme?: 'dark' | 'light'
}

export const CompareView: React.FC<CompareViewProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light'

  const [instr1, setInstr1] = useState<string>('R-format')
  const [instr2, setInstr2] = useState<string>('lw')

  const row1 = CONTROL_SIGNALS_MATRIX.find((r) => r.instruction === instr1) || CONTROL_SIGNALS_MATRIX[0]
  const row2 = CONTROL_SIGNALS_MATRIX.find((r) => r.instruction === instr2) || CONTROL_SIGNALS_MATRIX[1]

  const signalKeys: { key: keyof ControlMatrixRow; label: string }[] = [
    { key: 'regDst', label: 'RegDst' },
    { key: 'aluSrc', label: 'ALUSrc' },
    { key: 'memToReg', label: 'MemtoReg' },
    { key: 'regWrite', label: 'RegWrite (en_BR)' },
    { key: 'memRead', label: 'MemRead' },
    { key: 'memWrite', label: 'MemWrite' },
    { key: 'branch', label: 'Branch' },
    { key: 'aluOp1', label: 'ALUOp1' },
    { key: 'aluOp0', label: 'ALUOp0' },
    { key: 'jump', label: 'Jump' }
  ]

  const getDiagramInstr = (instr: string): 'R' | 'lw' | 'sw' | 'beq' | 'j' => {
    switch (instr) {
      case 'R-format':
        return 'R'
      case 'lw':
        return 'lw'
      case 'sw':
        return 'sw'
      case 'beq':
        return 'beq'
      case 'j':
        return 'j'
      default:
        return 'R'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ArrowLeftRight className="h-6 w-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Comparador Lado a Lado de Instrucciones
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Análisis Comparativo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Compara simultáneamente dos instrucciones cualesquiera del procesador MIPS monociclo
            para identificar contrastes en el camino de datos y las señales de control generadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-cyan-400 font-bold">Instr A:</span>
            <select
              value={instr1}
              onChange={(e) => {
                sounds.playClick()
                setInstr1(e.target.value)
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
            >
              {CONTROL_SIGNALS_MATRIX.map((r) => (
                <option key={r.instruction} value={r.instruction}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-amber-400 font-bold">Instr B:</span>
            <select
              value={instr2}
              onChange={(e) => {
                sounds.playClick()
                setInstr2(e.target.value)
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
            >
              {CONTROL_SIGNALS_MATRIX.map((r) => (
                <option key={r.instruction} value={r.instruction}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      } space-y-3 shadow-xl`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Matriz Diferencial de Señales de Control
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Las filas con diferencias se resaltan en ámbar
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Línea de Control</th>
                <th className="px-4 py-3 text-center text-cyan-300 font-bold">
                  {row1.label}
                </th>
                <th className="px-4 py-3 text-center text-amber-300 font-bold">
                  {row2.label}
                </th>
                <th className="px-4 py-3 text-center">¿Coinciden?</th>
                <th className="px-4 py-3">Impacto Arquitectónico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {signalKeys.map(({ key, label }) => {
                const val1 = row1[key]
                const val2 = row2[key]
                const isMatch = val1 === val2

                return (
                  <tr
                    key={key}
                    className={`transition-colors ${
                      !isMatch
                        ? 'bg-amber-950/20 font-semibold'
                        : 'bg-slate-900/30'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-bold text-white">{label}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-cyan-300">
                      {val1}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-amber-300">
                      {val2}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                          <Check className="h-3 w-3" /> Igual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                          <X className="h-3 w-3" /> Diferente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-300">
                      {!isMatch
                        ? `Cambia la selección en ${label === 'RegDst' ? 'Mux2' : label === 'ALUSrc' ? 'Mux3' : label === 'MemtoReg' ? 'Mux1' : label === 'Branch' ? 'Compuerta AND' : label === 'Jump' ? 'Mux5' : 'el módulo de destino'}.`
                        : 'Mismo comportamiento para ambas operaciones.'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        } space-y-3 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Camino Activo: {row1.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Opcode: {row1.opcode}</span>
          </div>

          <DatapathDiagram
            activeInstruction={getDiagramInstr(instr1)}
            theme={theme}
            showZoomControls={false}
            height="380px"
          />

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {row1.notes}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        } space-y-3 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Camino Activo: {row2.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Opcode: {row2.opcode}</span>
          </div>

          <DatapathDiagram
            activeInstruction={getDiagramInstr(instr2)}
            theme={theme}
            showZoomControls={false}
            height="380px"
          />

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {row2.notes}
          </p>
        </div>
      </div>
    </div>
  )
}
