import React, { useState } from 'react'
import { INSTRUCTION_FORMATS, type InstructionFormatInfo } from '../data/instructions'
import { X, Binary, CheckCircle2, BookOpen } from 'lucide-react'
import { sounds } from '../utils/audio'

interface InstructionFormatsProps {
  isOpen: boolean
  onClose: () => void
}

export const InstructionFormats: React.FC<InstructionFormatsProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'R' | 'I' | 'J'>('R')

  if (!isOpen) return null

  const currentInfo: InstructionFormatInfo =
    INSTRUCTION_FORMATS.find((f) => f.type === selectedFormat) || INSTRUCTION_FORMATS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Binary className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Formatos de Instrucción MIPS (32 bits)
              </h3>
              <p className="text-xs text-slate-400">
                Estructura de codificación binaria para la arquitectura MIPS
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

        {/* Selector de formato: R, I, J */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 gap-2 pt-3">
          {INSTRUCTION_FORMATS.map((fmt) => (
            <button
              key={fmt.type}
              onClick={() => {
                sounds.playClick()
                setSelectedFormat(fmt.type)
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl border-t border-x transition-all ${
                selectedFormat === fmt.type
                  ? 'border-cyan-500/40 bg-slate-900 text-cyan-300 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span className="font-mono font-bold">Tipo {fmt.type}</span>
              <span className="text-[11px] opacity-70 hidden sm:inline">
                {fmt.type === 'R' ? '(Registro)' : fmt.type === 'I' ? '(Inmediato)' : '(Salto)'}
              </span>
            </button>
          ))}
        </div>

        {/* Contenido del Formato */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Descripción general */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">Sintaxis:</span>
              <span className="text-xs font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                {currentInfo.syntax}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{currentInfo.description}</p>
          </div>

          {/* DIAGRAMA DE BITS (REPRESENTACIÓN VISUAL INTERACTIVA) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              Distribución de los 32 bits en memoria
            </h4>

            {/* Barra de bits dividida */}
            <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
              {currentInfo.fields.map((field, idx) => (
                <div
                  key={idx}
                  className={`p-2 sm:p-3 flex flex-col items-center justify-center border-r border-slate-800 last:border-r-0 ${field.color}`}
                  style={{
                    flex: field.name === 'inmediato' ? 16 : field.name === 'índice / target' ? 26 : field.bits.includes('6') ? 6 : 5
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold font-mono tracking-wider">{field.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{field.bits}</span>
                  <span className="text-[9px] font-mono opacity-60 mt-0.5">{field.bitRange}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicación campo por campo */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Detalle de cada campo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentInfo.fields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300">{field.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{field.bitRange}</span>
                  </div>
                  <p className="text-xs text-slate-300">{field.description}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded">
                    <span>Ejemplo: {field.exampleValue}</span>
                    <span className="text-emerald-400">Bin: {field.exampleBinary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ejemplos reales decodificados */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ejemplos reales en código máquina
            </h4>
            <div className="space-y-2">
              {currentInfo.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                      {ex.assembly}
                    </span>
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                      Hex: {ex.hex}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded overflow-x-auto">
                    Binario: {ex.binary}
                  </div>
                  <p className="text-xs text-slate-300">{ex.meaning}</p>
                </div>
              ))}
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
