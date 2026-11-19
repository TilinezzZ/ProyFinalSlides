export interface RegisterEntry {
  regNumber: number
  regName: string
  value: number
}

export interface MemoryEntry {
  address: number
  value: number
}

export const INITIAL_LW_REGISTERS: RegisterEntry[] = [
  { regNumber: 7, regName: '$a3', value: 100 },
  { regNumber: 8, regName: '$t0', value: 125 },
  { regNumber: 9, regName: '$t1', value: 25 },
  { regNumber: 10, regName: '$t2', value: 220 },
  { regNumber: 11, regName: '$t3', value: 96 },
  { regNumber: 12, regName: '$t4', value: 950 },
  { regNumber: 13, regName: '$t5', value: 23 },
  { regNumber: 14, regName: '$t6', value: 20 },
  { regNumber: 15, regName: '$t7', value: 20 },
  { regNumber: 16, regName: '$s0', value: 24 },
  { regNumber: 17, regName: '$s1', value: 28 }
]

export const INITIAL_LW_MEMORY: MemoryEntry[] = [
  { address: 20, value: 500 },
  { address: 21, value: 120 },
  { address: 22, value: 700 },
  { address: 23, value: 45 },
  { address: 24, value: 780 },
  { address: 25, value: 965 },
  { address: 26, value: 345 },
  { address: 27, value: 555 },
  { address: 28, value: 609 },
  { address: 29, value: 201 },
  { address: 30, value: 200 }
]

export const SLIDE_26_REGISTERS = INITIAL_LW_REGISTERS
export const SLIDE_26_MEMORY = INITIAL_LW_MEMORY
