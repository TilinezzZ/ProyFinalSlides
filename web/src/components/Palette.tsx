import React, { useState } from 'react'
import type { DatapathComponent } from '../data/components'
import { Search, Info, GripVertical, CheckCircle2 } from 'lucide-react'
import { sounds } from '../utils/audio'

interface PaletteProps {
  components: DatapathComponent[]
  placedComponents: Record<string, boolean>
  selectedComponentId: string | null
  onSelectComponent: (componentId: string | null) => void
  onInspectComponent: (component: DatapathComponent) => void
}

export const Palette: React.FC<PaletteProps> = ({
  components,
  placedComponents,
  selectedComponentId,
  onSelectComponent,
  onInspectComponent
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filtrar componentes no colocados
  const unplacedComponents = components.filter((c) => !placedComponents[c.id])

  const filteredComponents = unplacedComponents.filter((comp) => {
    const matchesCategory =
      filterCategory === 'all' || comp.category === filterCategory
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'fetch', label: 'Fetch' },
    { id: 'decode', label: 'Decodificación' },
    { id: 'execute', label: 'ALU/Ejecución' },
    { id: 'memory', label: 'Memoria' },
    { id: 'control', label: 'Control' },
    { id: 'branch_jump', label: 'Saltos' }
  ]

  const handleDragStart = (e: React.DragEvent, compId: string) => {
    sounds.playClick()
    e.dataTransfer.setData('text/plain', compId)
    e.dataTransfer.effectAllowed = 'move'
    onSelectComponent(compId)
  }

  return (
    <div className="w-full border-t border-cyan-950/60 bg-slate-950/90 backdrop-blur-md px-3 py-2.5 shadow-2xl">
      <div className="mx-auto max-w-7xl flex flex-col gap-2">
        {/* Barra superior de la paleta: Filtros, Búsqueda y Contador */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Categorías */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick()
                  setFilterCategory(cat.id)
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  filterCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Buscador y Contador */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar componente..."
                className="w-36 sm:w-48 pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
              <span className="text-cyan-400 font-bold">{unplacedComponents.length}</span> restantes
            </div>
          </div>
        </div>

        {/* Carrusel / Lista de Piezas disponibles */}
        {unplacedComponents.length === 0 ? (
          <div className="py-4 text-center flex flex-col items-center justify-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
            <p className="text-sm font-semibold">¡Todas las 18 piezas han sido colocadas con éxito!</p>
            <p className="text-xs text-slate-400">
              Pasa al modo de Simulación para probar instrucciones o haz clic en cualquier pieza para inspeccionar su Verilog.
            </p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500">
            No se encontraron componentes con el filtro actual.
          </div>
        ) : (
          <div className="flex items-stretch gap-2.5 overflow-x-auto py-1 px-1">
            {filteredComponents.map((comp) => {
              const isSelected = selectedComponentId === comp.id

              return (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.id)}
                  onClick={() => {
                    sounds.playClick()
                    onSelectComponent(isSelected ? null : comp.id)
                  }}
                  className={`group relative flex-shrink-0 flex items-center justify-between gap-2.5 p-2 rounded-xl border bg-slate-900/90 cursor-grab active:cursor-grabbing hover:scale-102 transition-all shadow-md select-none min-w-[170px] sm:min-w-[190px] ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/40'
                      : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850'
                  }`}
                  title={`${comp.name} - Arrastra al lienzo o selecciónalo para colocarlo`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 font-mono tracking-tight group-hover:text-cyan-300">
                        {comp.shortLabel}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        {comp.categoryName}
                      </div>
                    </div>
                  </div>

                  {/* Botón de inspeccionar info */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      sounds.playClick()
                      onInspectComponent(comp)
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title={`Ver detalles técnicos y Verilog de ${comp.name}`}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
