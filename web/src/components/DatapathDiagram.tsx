import React, { useState } from 'react'
import { COMPONENTS, type DatapathComponent } from '../data/components'
import { WIRES, type WirePath } from '../data/wires'
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react'

interface DatapathDiagramProps {
  activeInstruction?: 'R' | 'lw' | 'sw' | 'beq' | 'j'
  activeComponentIds?: string[]
  activeWireIds?: string[]
  highlightedStepNumber?: number
  busValues?: Record<string, string>
  onSelectComponent?: (comp: DatapathComponent) => void
  theme?: 'dark' | 'light'
  showZoomControls?: boolean
  caption?: string
  height?: string
}

export const DatapathDiagram: React.FC<DatapathDiagramProps> = ({
  activeInstruction = 'R',
  activeComponentIds,
  activeWireIds,
  highlightedStepNumber,
  busValues = {},
  onSelectComponent,
  theme = 'dark',
  showZoomControls = true,
  caption,
  height = '540px'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null)

  const defaultActiveComponentsForInstruction: Record<string, string[]> = {
    R: [
      'pc', 'adder_pc4', 'instruction_mem', 'control_unit', 'mux2',
      'register_file', 'mux3', 'alu_control', 'alu', 'mux1', 'mux4', 'mux5'
    ],
    lw: [
      'pc', 'adder_pc4', 'instruction_mem', 'control_unit', 'mux2',
      'register_file', 'sign_ext', 'mux3', 'alu_control', 'alu', 'data_mem',
      'mux1', 'mux4', 'mux5'
    ],
    sw: [
      'pc', 'adder_pc4', 'instruction_mem', 'control_unit',
      'register_file', 'sign_ext', 'mux3', 'alu_control', 'alu', 'data_mem',
      'mux4', 'mux5'
    ],
    beq: [
      'pc', 'adder_pc4', 'instruction_mem', 'control_unit',
      'register_file', 'sign_ext', 'mux3', 'alu_control', 'alu',
      'shift_branch', 'adder_branch', 'and_gate', 'mux4', 'mux5'
    ],
    j: [
      'pc', 'adder_pc4', 'instruction_mem', 'control_unit',
      'shift_jump', 'mux5'
    ]
  }

  const defaultActiveWiresForInstruction: Record<string, string[]> = {
    R: [
      'pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out',
      'adder_pc4_to_mux4', 'instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf',
      'instr_rd_to_mux2', 'ctrl_regdst', 'mux2_out', 'ctrl_en_br',
      'rf_dr1_to_alu', 'rf_dr2_to_mux3', 'ctrl_alu_src', 'mux3_out',
      'instr_funct_to_alu_ctrl', 'ctrl_alu_op', 'alu_ctrl_out', 'alu_out_to_mux1',
      'ctrl_mem_to_reg', 'mux1_out_to_dw', 'mux4_out_to_mux5', 'mux5_out_to_pc'
    ],
    lw: [
      'pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out',
      'adder_pc4_to_mux4', 'instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_mux2',
      'ctrl_regdst', 'mux2_out', 'instr_imm_to_sign_ext', 'sign_ext_to_mux3',
      'ctrl_alu_src', 'mux3_out', 'ctrl_alu_op', 'alu_ctrl_out', 'rf_dr1_to_alu',
      'alu_out_to_dmem', 'ctrl_mem_read', 'dmem_out_to_mux1', 'ctrl_mem_to_reg',
      'ctrl_en_br', 'mux1_out_to_dw', 'mux4_out_to_mux5', 'mux5_out_to_pc'
    ],
    sw: [
      'pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out',
      'adder_pc4_to_mux4', 'instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf',
      'instr_imm_to_sign_ext', 'sign_ext_to_mux3', 'ctrl_alu_src', 'mux3_out',
      'ctrl_alu_op', 'alu_ctrl_out', 'rf_dr1_to_alu', 'rf_dr2_to_dmem',
      'alu_out_to_dmem', 'ctrl_mem_write', 'mux4_out_to_mux5', 'mux5_out_to_pc'
    ],
    beq: [
      'pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out',
      'adder_pc4_to_adder_br', 'adder_pc4_to_mux4', 'instr_to_ctrl',
      'instr_rs_to_rf', 'instr_rt_to_rf', 'rf_dr1_to_alu', 'rf_dr2_to_mux3',
      'ctrl_alu_src', 'mux3_out', 'ctrl_alu_op', 'alu_ctrl_out', 'alu_zf_to_and',
      'ctrl_branch', 'and_out_to_mux4', 'instr_imm_to_sign_ext', 'sign_ext_to_shift_br',
      'shift_br_out', 'adder_br_out_to_mux4', 'mux4_out_to_mux5', 'mux5_out_to_pc'
    ],
    j: [
      'pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out',
      'adder_pc4_top_bits', 'instr_to_ctrl', 'ctrl_jump', 'instr_jump_to_shift_j',
      'shift_jump_out', 'mux5_out_to_pc'
    ]
  }

  const effectiveActiveComponents =
    activeComponentIds || defaultActiveComponentsForInstruction[activeInstruction] || []
  const effectiveActiveWires =
    activeWireIds || defaultActiveWiresForInstruction[activeInstruction] || []

  const isLight = theme === 'light'

  const getWireStroke = (wire: WirePath, isActive: boolean) => {
    if (!isActive) {
      return isLight ? '#cbd5e1' : '#1e293b'
    }

    if (wire.isControl || wire.colorType === 'control') {
      return '#38bdf8'
    }
    if (wire.colorType === 'address') {
      return '#34d399'
    }
    if (wire.colorType === 'feedback') {
      return '#fbbf24'
    }
    return '#00f0ff'
  }

  return (
    <div className={`relative w-full rounded-2xl border transition-colors overflow-hidden select-none flex flex-col items-center justify-center ${
      isLight
        ? 'bg-slate-50 border-slate-300 shadow-md text-slate-900'
        : 'bg-circuit-grid border-cyan-950/60 shadow-2xl text-slate-100'
    }`}
    style={{ minHeight: height }}
    >

      {showZoomControls && (
        <div className={`absolute top-3 right-3 z-20 flex items-center gap-1 rounded-xl p-1 backdrop-blur-md border shadow-md ${
          isLight ? 'bg-white/90 border-slate-300' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.5))}
            className="p-1.5 hover:text-cyan-500 rounded-lg transition-colors"
            title="Acercar"
            aria-label="Acercar zoom"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1 min-w-[2.5rem] text-center opacity-70">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
            className="p-1.5 hover:text-cyan-500 rounded-lg transition-colors"
            title="Alejar"
            aria-label="Alejar zoom"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:text-cyan-500 rounded-lg transition-colors"
            title="Restablecer"
            aria-label="Restablecer escala"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {caption && (
        <div className={`absolute top-3 left-4 z-20 text-xs font-mono font-bold flex items-center gap-2 ${
          isLight ? 'text-cyan-700' : 'text-cyan-400'
        }`}>
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{caption}</span>
          {highlightedStepNumber && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              Paso {highlightedStepNumber}
            </span>
          )}
        </div>
      )}

      <div
        className="w-full h-full flex items-center justify-center p-2"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out'
        }}
      >
        <svg
          viewBox="0 0 1080 650"
          className="w-full max-w-5xl h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id={`glow-wire-${theme}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="active-chip" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>
            <linearGradient id="dimmed-chip" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLight ? '#f1f5f9' : '#0f172a'} />
              <stop offset="100%" stopColor={isLight ? '#e2e8f0' : '#1e293b'} />
            </linearGradient>
          </defs>

          <g id="wires-layer">
            {WIRES.map((wire) => {
              const isActive = effectiveActiveWires.includes(wire.id)
              const strokeColor = getWireStroke(wire, isActive)
              const strokeWidth = isActive ? 3.5 : 1.5
              const opacity = isActive ? 1 : isLight ? 0.35 : 0.2

              return (
                <g key={wire.id}>
                  <path
                    d={wire.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={wire.isControl ? '5,4' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={opacity}
                    filter={isActive ? `url(#glow-wire-${theme})` : undefined}
                  />

                  {isActive && (
                    <circle r="4" fill="#ffffff" filter={`url(#glow-wire-${theme})`}>
                      <animateMotion
                        path={wire.d}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              )
            })}
          </g>

          <g id="components-layer">
            {COMPONENTS.map((comp) => {
              const isActive = effectiveActiveComponents.includes(comp.id)
              const isHovered = hoveredComponentId === comp.id
              const { x, y, width, height } = comp.slotCoordinates

              return (
                <g
                  key={comp.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => onSelectComponent && onSelectComponent(comp)}
                  onMouseEnter={() => setHoveredComponentId(comp.id)}
                  onMouseLeave={() => setHoveredComponentId(null)}
                  className={`cursor-pointer transition-all duration-300 ${
                    !isActive ? 'opacity-30 grayscale filter' : 'opacity-100'
                  }`}
                >

                  <rect
                    x="-2"
                    y="-2"
                    width={width + 4}
                    height={height + 4}
                    rx="8"
                    fill="none"
                    stroke={
                      isActive
                        ? isHovered
                          ? '#00f0ff'
                          : '#0284c7'
                        : isLight
                        ? '#cbd5e1'
                        : '#334155'
                    }
                    strokeWidth={isActive ? '2' : '1'}
                    filter={isActive ? `url(#glow-wire-${theme})` : undefined}
                  />

                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height={height}
                    rx="6"
                    fill={isActive ? 'url(#active-chip)' : 'url(#dimmed-chip)'}
                    stroke={isActive ? '#38bdf8' : isLight ? '#94a3b8' : '#475569'}
                    strokeWidth="1.2"
                  />

                  <rect
                    x="0"
                    y="0"
                    width={width}
                    height="18"
                    rx="6"
                    fill={isActive ? '#0369a1' : isLight ? '#cbd5e1' : '#1e293b'}
                    opacity={isActive ? 0.45 : 0.6}
                  />

                  <circle cx="6" cy="9" r="2" fill={isActive ? '#38bdf8' : '#64748b'} />
                  <circle cx={width - 6} cy="9" r="2" fill={isActive ? '#38bdf8' : '#64748b'} />

                  <text
                    x={width / 2}
                    y={height > 70 ? 28 : height / 2 + 3}
                    fill={isActive ? '#f8fafc' : isLight ? '#475569' : '#94a3b8'}
                    fontSize={width < 60 ? '9' : '11'}
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {comp.shortLabel}
                  </text>

                  {height > 85 && (
                    <text
                      x={width / 2}
                      y={height - 12}
                      fill={isActive ? '#38bdf8' : '#64748b'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      opacity="0.8"
                    >
                      {comp.categoryName.split(' ')[0]}
                    </text>
                  )}

                  {onSelectComponent && (
                    <g transform={`translate(${width - 15}, ${height - 15})`} opacity={isActive ? 0.8 : 0.3}>
                      <circle cx="5" cy="5" r="5" fill="#0284c7" />
                      <text x="5" y="8" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                        i
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {Object.keys(busValues).length > 0 && (
            <g id="live-bus-overlay">
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
                      fill={isLight ? '#ffffff' : '#0f172a'}
                      stroke={isLight ? '#38bdf8' : '#0284c7'}
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x="6"
                      y="2"
                      fill={isLight ? '#475569' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {key}:
                    </text>
                    <text
                      x="228"
                      y="2"
                      fill={isLight ? '#0284c7' : '#38bdf8'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>

      <div className={`w-full border-t px-4 py-1.5 flex items-center justify-between text-[11px] font-mono ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <Info className="h-3 w-3 text-cyan-400" />
          <span>
            {effectiveActiveComponents.length} de 18 componentes activos para {activeInstruction}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Cables de Datos
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Señales de Control
          </span>
          <span className="flex items-center gap-1 opacity-60">
            <span className="h-2 w-2 rounded-full bg-slate-500" /> No Usados
          </span>
        </div>
      </div>
    </div>
  )
}
