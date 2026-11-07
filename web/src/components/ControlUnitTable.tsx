import React, { useState } from 'react'
import { CONTROL_SIGNALS_TABLE, type ControlSignalRow } from '../data/controlTable'
import { X, Table2, Play, Info } from 'lucide-react'
import { sounds } from '../utils/audio'

interface ControlUnitTableProps {
  isOpen: boolean
  onClose: () => void
  onSimulateInstruction?: (instructionId: 'R' | 'lw' | 'sw' | 'beq_taken' | 'j') => void
}

export const ControlUnitTable: React.FC<ControlUnitTableProps> = ({
  isOpen,
  onClose,
  onSimulateInstruction
}) => {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0)

  if (!isOpen) return null

  const selectedRow: ControlSignalRow = CONTROL_SIGNALS_TABLE[selectedRowIndex]

  const getSimId = (index: number): 'R' | 'lw' | 'sw' | 'beq_taken' | 'j' => {
    switch (index) {
      case 0:
        return 'R'
      case 1:
        return 'lw'
      case 2:
        return 'sw'
      case 3:
        return 'beq_taken'
      case 4:
        return 'j'
      default:
        return 'R'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400">
              <Table2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Tabla de Señales de la Unidad de Control
              </h3>
              <p className="text-xs text-slate-400">
                Lógica de decodificación para el procesador monociclo MIPS (Diapositiva 17)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick()
              onClose()
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido Modal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Haz clic en cualquier instrucción para resaltar sus señales activas y leer la justificación técnica de arquitectura de computadoras:
          </p>

          {/* TABLA INTERACTIVA DE SEÑALES */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Instrucción</th>
                  <th className="px-2 py-3 text-center">RegDst</th>
                  <th className="px-2 py-3 text-center">ALU_Src</th>
                  <th className="px-2 py-3 text-center">MemToReg</th>
                  <th className="px-2 py-3 text-center text-cyan-400">en_BR</th>
                  <th className="px-2 py-3 text-center">MemRead</th>
                  <th className="px-2 py-3 text-center">MemWrite</th>
                  <th className="px-2 py-3 text-center">Branch</th>
                  <th className="px-2 py-3 text-center text-amber-400">ALU Op</th>
                  <th className="px-2 py-3 text-center">Jump</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {CONTROL_SIGNALS_TABLE.map((row, idx) => {
                  const isSelected = selectedRowIndex === idx
                  return (
                    <tr
                      key={row.instruction}
                      onClick={() => {
                        sounds.playClick()
                        setSelectedRowIndex(idx)
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/40 border-l-4 border-cyan-400 text-white font-bold'
                          : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={isSelected ? 'text-cyan-300' : 'text-slate-200'}>
                            {row.instruction}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans px-1.5 py-0.5 rounded bg-slate-800">
                            {row.assemblyExample}
                          </span>
                        </div>
                      </td>

                      {/* Señales de Control */}
                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.regDst === '1'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.regDst}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.aluSrc === '1'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.aluSrc}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.memToReg === '1'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.memToReg}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            row.enBR === '1'
                              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.enBR}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.memRead === '1'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.memRead}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.memWrite === '1'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.memWrite}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.branch === '1'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.branch}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                          {row.aluOp}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            row.jump === '1'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.jump}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Panel explicativo de la instrucción seleccionada */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Análisis: {selectedRow.instruction}
                </h4>
              </div>

              {onSimulateInstruction && (
                <button
                  onClick={() => {
                    sounds.playPulse()
                    onClose()
                    onSimulateInstruction(getSimId(selectedRowIndex))
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md shadow-emerald-950/50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Probar en Simulación</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedRow.description}
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 leading-relaxed font-sans">
              <span className="font-bold text-white">Por qué estas señales: </span>
              {selectedRow.notes}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-5 py-3 flex items-center justify-end">
          <button
            onClick={() => {
              sounds.playClick()
              onClose()
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
