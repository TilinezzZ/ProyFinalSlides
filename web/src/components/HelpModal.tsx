import React from 'react'
import { X, HelpCircle, Users, BookOpen, ExternalLink, Cpu } from 'lucide-react'
import { sounds } from '../utils/audio'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Acerca del Proyecto y Guía de Uso
              </h3>
              <p className="text-xs text-slate-400">
                Seminario de Solución de Problemas de Arquitectura de Computadoras
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Instrucciones de Uso */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              ¿Cómo usar la plataforma?
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 font-bold font-mono text-[11px] border border-cyan-800">
                  1
                </span>
                <p>
                  <strong className="text-white">Arma el Datapath:</strong> En la paleta inferior encontrarás los 18 componentes exactos del procesador de la diapositiva 17. Arrástralos al lienzo o haz clic en una pieza y luego en su slot para encajarla.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 font-bold font-mono text-[11px] border border-cyan-800">
                  2
                </span>
                <p>
                  <strong className="text-white">Aprende su Función y Verilog:</strong> Al hacer clic en cualquier componente colocado o en el botón (i) de la paleta, podrás ver su descripción funcional, tabla de entradas y salidas con su ancho de bits y su código Verilog sintetizable para ModelSim.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 font-bold font-mono text-[11px] border border-cyan-800">
                  3
                </span>
                <p>
                  <strong className="text-white">Simula Instrucciones:</strong> En el modo Simulación, recorre paso a paso la ejecución de instrucciones Tipo R (add), lw, sw, beq y j. Observarás los pulsos de señales viajando por los cables y los valores en los buses.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 font-bold font-mono text-[11px] border border-cyan-800">
                  4
                </span>
                <p>
                  <strong className="text-white">Formatos y Unidad de Control:</strong> Consulta en la barra superior los formatos binarios MIPS (R, I, J) y la tabla interactiva de señales que activa la Unidad de Control.
                </p>
              </div>
            </div>
          </div>

          {/* Créditos del Equipo */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Créditos del Proyecto
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Universidad de Guadalajara · CUCEI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Proyecto Final: Procesador MIPS de 32 bits de un solo ciclo (Diapositiva 17: "Datapath Completo").
              </p>
              <div className="text-xs text-slate-300 pt-1 space-y-1">
                <p>
                  • <strong className="text-white">Módulo Datapath & Plataforma Web Interactiva:</strong> Simulación RTL en Verilog, ModelSim y Aplicación Web Interactiva de Rompecabezas.
                </p>
                <p>
                  • <strong className="text-white">Equipo de 3 integrantes</strong> del Seminario de Solución de Problemas de Arquitectura de Computadoras.
                </p>
              </div>
            </div>
          </div>

          {/* Enlaces */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <a
              href="https://github.com/TilinezzZ/ProyFinalSlides"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
            >
              <span>Repositorio en GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-xs text-slate-500 font-mono">
              Deploy automático en Vercel
            </span>
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
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
