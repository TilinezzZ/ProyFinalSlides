import React, { useState } from 'react'
import type { DatapathComponent } from '../data/components'
import { X, Copy, Check, FileCode2, Cpu, ArrowRightLeft, Layers } from 'lucide-react'
import { sounds } from '../utils/audio'

interface ComponentInspectorProps {
  component: DatapathComponent | null
  onClose: () => void
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  component,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'info' | 'ports' | 'verilog'>('info')

  if (!component) return null

  const handleCopyVerilog = () => {
    sounds.playClick()
    navigator.clipboard.writeText(component.verilogCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{component.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  {component.categoryName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archivo RTL: <span className="font-mono text-cyan-400">verilog/{component.verilogFileName}</span>
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

        {/* Pestañas de Navegación interna */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Descripción y Función</span>
          </button>
          <button
            onClick={() => setActiveTab('ports')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ports'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Entradas y Salidas ({component.inputs.length + component.outputs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verilog')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'verilog'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Código Verilog</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Descripción General
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                  {component.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Propósito en el Datapath de la Diapositiva 17
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800">
                  {component.purpose}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Instrucciones en las que participa
                </h4>
                <div className="flex flex-wrap gap-2">
                  {component.instructions.map((inst) => (
                    <span
                      key={inst}
                      className="text-xs font-mono px-3 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-cyan-300 font-bold"
                    >
                      {inst === 'R' ? 'Tipo R (add, sub, and, or, slt)' : inst}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Pista de ubicación en el rompecabezas
                </h4>
                <p className="text-xs text-amber-300/90 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 font-sans">
                  💡 {component.hint}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ports' && (
            <div className="space-y-4">
              {/* Entradas */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Puertos de Entrada (Inputs)
                </h4>
                <div className="space-y-2">
                  {component.inputs.map((port, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                          {port.name}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                          {port.bits}
                        </span>
                        {port.isControl && (
                          <span className="text-[10px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                            Control
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 sm:text-right">{port.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salidas */}
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Puertos de Salida (Outputs)
                </h4>
                <div className="space-y-2">
                  {component.outputs.map((port, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded">
                          {port.name}
                        </span>
                        <span className="font-mono text-[11px] text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                          {port.bits}
                        </span>
                        {port.isControl && (
                          <span className="text-[10px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                            Control
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 sm:text-right">{port.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verilog' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Sintetizable en ModelSim / Quartus
                </span>
                <button
                  onClick={handleCopyVerilog}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-900/60 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto leading-relaxed shadow-inner">
                {component.verilogCode}
              </pre>
            </div>
          )}
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
