import React, { useState } from 'react'
import type { DatapathComponent } from '../data/components'
import type { WirePath } from '../data/wires'
import type { AppMode } from './Navbar'
import { Info, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { sounds } from '../utils/audio'

interface DatapathCanvasProps {
  mode: AppMode
  components: DatapathComponent[]
  placedComponents: Record<string, boolean>
  wires: WirePath[]
  activeComponentIds: string[]
  activeWireIds: string[]
  busValues: Record<string, string>
  onSlotDrop: (targetSlotId: string, droppedComponentId: string) => void
  onSelectComponent: (component: DatapathComponent) => void
  onRemovePlaced: (componentId: string) => void
  selectedPaletteComponentId: string | null
  feedbackMessage: { text: string; type: 'success' | 'error' | 'info' } | null
}

export const DatapathCanvas: React.FC<DatapathCanvasProps> = ({
  mode,
  components,
  placedComponents,
  wires,
  activeComponentIds,
  activeWireIds,
  busValues,
  onSlotDrop,
  onSelectComponent,
  onRemovePlaced,
  selectedPaletteComponentId,
  feedbackMessage
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null)
  const [shakingSlotId, setShakingSlotId] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    const droppedId = e.dataTransfer.getData('text/plain')
    if (droppedId) {
      if (droppedId !== slotId) {
        setShakingSlotId(slotId)
        setTimeout(() => setShakingSlotId(null), 500)
      }
      onSlotDrop(slotId, droppedId)
    }
  }

  const handleSlotClick = (slotComponent: DatapathComponent) => {
    // Si el usuario tiene una pieza seleccionada de la paleta, intentar colocarla en este slot
    if (selectedPaletteComponentId) {
      if (selectedPaletteComponentId !== slotComponent.id) {
        setShakingSlotId(slotComponent.id)
        setTimeout(() => setShakingSlotId(null), 500)
      }
      onSlotDrop(slotComponent.id, selectedPaletteComponentId)
    } else if (placedComponents[slotComponent.id]) {
      // Si ya está colocada, abrir el inspector al hacer click
      sounds.playClick()
      onSelectComponent(slotComponent)
    }
  }

  const getWireStrokeColor = (wire: WirePath, isActive: boolean) => {
    if (!isActive) return '#1e293b' // slate-800
    switch (wire.colorType) {
      case 'control':
        return '#c084fc' // purple-400
      case 'address':
        return '#34d399' // emerald-400
      case 'data':
        return '#38bdf8' // sky-400
      case 'feedback':
        return '#fbbf24' // amber-400
      default:
        return '#38bdf8'
    }
  }

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      {/* Toast Feedback flotante */}
      {feedbackMessage && (
        <div
          className={`absolute top-4 z-30 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-2xl transition-all duration-300 animate-bounce flex items-center gap-2 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/60 shadow-rose-500/20'
              : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/60 shadow-cyan-500/20'
          }`}
        >
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Controles de Zoom */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Acercar zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[3rem] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Alejar zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Ajustar escala 100%"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Contenedor SVG principal con zoom y pan */}
      <div
        className="w-full h-full max-w-6xl max-h-[720px] rounded-2xl border border-cyan-900/30 bg-circuit-grid shadow-2xl shadow-cyan-950/30 overflow-hidden relative flex items-center justify-center"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out'
        }}
      >
        <svg
          viewBox="0 0 1080 650"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Filtros de Resplandor Neón */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="glow-control" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradientes */}
            <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            <linearGradient id="active-chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06253b" />
              <stop offset="100%" stopColor="#081b2a" />
            </linearGradient>
          </defs>

          {/* 1. LEYENDA DEL DATAPATH */}
          <text x="30" y="35" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace" opacity="0.8">
            ESQUEMA RTL MIPS (DIAPOSITIVA 17)
          </text>
          <text x="30" y="52" fill="#64748b" fontSize="10" fontFamily="monospace">
            UN SOLO CICLO · 32 BITS · ARQUITECTURA VON NEUMANN
          </text>

          {/* 2. CABLES Y BUSES SVG */}
          <g id="wires-group">
            {wires.map((wire) => {
              const isActive = activeWireIds.includes(wire.id)
              const strokeColor = getWireStrokeColor(wire, isActive)
              const strokeWidth = isActive ? 3.5 : 1.8
              const isDashed = wire.isControl

              return (
                <g key={wire.id}>
                  {/* Cable principal */}
                  <path
                    d={wire.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? '5,4' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isActive ? 'url(#glow-cyan)' : undefined}
                    opacity={isActive ? 1 : 0.45}
                    className={isActive ? 'transition-all duration-300' : ''}
                  />

                  {/* Partícula de pulso animada que viaja por el cable si está activo */}
                  {isActive && (
                    <circle r="4.5" fill="#ffffff" filter="url(#glow-cyan)">
                      <animateMotion
                        path={wire.d}
                        dur={mode === 'simulate' ? '1.8s' : '2.5s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              )
            })}
          </g>

          {/* 3. SLOTS Y COMPONENTES DEL ROMPECABEZAS */}
          <g id="slots-group">
            {components.map((comp) => {
              const isPlaced = placedComponents[comp.id]
              const isActive = activeComponentIds.includes(comp.id)
              const isHovered = hoveredSlotId === comp.id
              const isShaking = shakingSlotId === comp.id
              const { x, y, width, height } = comp.slotCoordinates

              return (
                <g
                  key={comp.id}
                  transform={`translate(${x}, ${y})`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, comp.id)}
                  onClick={() => handleSlotClick(comp)}
                  onMouseEnter={() => setHoveredSlotId(comp.id)}
                  onMouseLeave={() => setHoveredSlotId(null)}
                  className={`cursor-pointer transition-transform duration-200 ${
                    isShaking ? 'animate-shake' : ''
                  }`}
                >
                  {isPlaced ? (
                    /* COMPONENTE COLOCADO */
                    <g>
                      {/* Sombra / Halo de resplandor si está activo */}
                      <rect
                        x="-2"
                        y="-2"
                        width={width + 4}
                        height={height + 4}
                        rx="8"
                        fill="none"
                        stroke={isActive ? '#00f0ff' : '#0284c7'}
                        strokeWidth={isActive ? '2.5' : '1.2'}
                        opacity={isActive ? 1 : 0.6}
                        filter={isActive ? 'url(#glow-cyan)' : undefined}
                      />

                      {/* Cuerpo del Chip / Componente */}
                      <rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        rx="6"
                        fill={isActive ? 'url(#active-chip-grad)' : 'url(#chip-grad)'}
                        stroke="#0ea5e9"
                        strokeWidth="1.2"
                      />

                      {/* Banda superior de tipo chip */}
                      <rect
                        x="0"
                        y="0"
                        width={width}
                        height="18"
                        rx="6"
                        fill="#0369a1"
                        opacity="0.35"
                      />

                      {/* Pines metálicos decorativos en los bordes */}
                      <circle cx="6" cy="9" r="2" fill="#38bdf8" opacity="0.8" />
                      <circle cx={width - 6} cy="9" r="2" fill="#38bdf8" opacity="0.8" />

                      {/* Etiqueta del Componente */}
                      <text
                        x={width / 2}
                        y={height > 70 ? 28 : height / 2 + 3}
                        fill="#f8fafc"
                        fontSize={width < 60 ? '9' : '11'}
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {comp.shortLabel}
                      </text>

                      {/* Subtítulo / Categoría si cabe */}
                      {height > 85 && (
                        <text
                          x={width / 2}
                          y={height - 12}
                          fill="#38bdf8"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          opacity="0.85"
                        >
                          {comp.categoryName.split(' ')[0]}
                        </text>
                      )}

                      {/* Botón de inspeccionar */}
                      <g
                        transform={`translate(${width - 16}, ${height - 16})`}
                        onClick={(e) => {
                          e.stopPropagation()
                          sounds.playClick()
                          onSelectComponent(comp)
                        }}
                        className="hover:opacity-100 opacity-60 transition-opacity"
                      >
                        <circle cx="6" cy="6" r="6" fill="#0284c7" />
                        <text x="6" y="9" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                          i
                        </text>
                      </g>

                      {/* Botón de remover pieza (solo en Aprender y Reto) */}
                      {mode !== 'simulate' && (
                        <g
                          transform={`translate(-6, -6)`}
                          onClick={(e) => {
                            e.stopPropagation()
                            sounds.playError()
                            onRemovePlaced(comp.id)
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          <circle cx="8" cy="8" r="7" fill="#dc2626" />
                          <line x1="5" y1="5" x2="11" y2="11" stroke="#ffffff" strokeWidth="1.5" />
                          <line x1="11" y1="5" x2="5" y2="11" stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                      )}
                    </g>
                  ) : (
                    /* SLOT VACÍO (SILUETA) */
                    <g>
                      <rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        rx="6"
                        fill={isHovered ? 'rgba(14, 165, 233, 0.12)' : 'rgba(15, 23, 42, 0.5)'}
                        stroke={
                          isHovered
                            ? '#38bdf8'
                            : mode === 'learn'
                            ? 'rgba(56, 189, 248, 0.4)'
                            : 'rgba(245, 158, 11, 0.35)'
                        }
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="transition-colors duration-200"
                      />

                      {mode === 'learn' ? (
                        /* Modo Aprender: Muestra el nombre sugerido */
                        <g>
                          <text
                            x={width / 2}
                            y={height / 2 - 2}
                            fill="#38bdf8"
                            fontSize={width < 60 ? '8' : '10'}
                            fontWeight="600"
                            fontFamily="monospace"
                            textAnchor="middle"
                            opacity={isHovered ? 1 : 0.65}
                          >
                            {comp.shortLabel}
                          </text>
                          <text
                            x={width / 2}
                            y={height / 2 + 10}
                            fill="#64748b"
                            fontSize="7.5"
                            fontFamily="sans-serif"
                            textAnchor="middle"
                          >
                            Arrastra aquí
                          </text>
                        </g>
                      ) : (
                        /* Modo Reto: Muestra signo de interrogación o número */
                        <g>
                          <text
                            x={width / 2}
                            y={height / 2 + 5}
                            fill="#f59e0b"
                            fontSize="13"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                            opacity="0.6"
                          >
                            ?
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* 4. VALORES DE BUSES FLOTANTES EN SIMULACIÓN */}
          {mode === 'simulate' && (
            <g id="bus-values-overlay">
              {Object.entries(busValues).map(([key, val], idx) => {
                const posX = 40 + (idx % 4) * 255
                const posY = 615 + Math.floor(idx / 4) * 22
                return (
                  <g key={key} transform={`translate(${posX}, ${posY})`}>
                    <rect
                      x="0"
                      y="-12"
                      width="235"
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      stroke="#0284c7"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text x="6" y="2" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      {key}:
                    </text>
                    <text x="228" y="2" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                      {val}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Pista rápida al pie del lienzo */}
      <div className="mt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Info className="h-3.5 w-3.5 text-cyan-400" />
        <span>
          {mode === 'learn'
            ? 'Arrastra las piezas desde la paleta inferior o toca una pieza y luego su slot para colocarla.'
            : mode === 'challenge'
            ? 'Coloca los 18 componentes sin pistas en el menor tiempo posible.'
            : 'Observa el flujo de señales de datos y control a través de los buses.'}
        </span>
      </div>
    </div>
  )
}
