export interface ControlSignalRow {
  instruction: string
  assemblyExample: string
  format: 'R' | 'I' | 'J'
  regDst: string
  aluSrc: string
  memToReg: string
  enBR: string
  memRead: string
  memWrite: string
  branch: string
  aluOp: string
  jump: string
  description: string
  notes: string
}

export const CONTROL_SIGNALS_TABLE: ControlSignalRow[] = [
  {
    instruction: 'Tipo R (add, sub, and, or, slt)',
    assemblyExample: 'add $t0, $s1, $s2',
    format: 'R',
    regDst: '1',
    aluSrc: '0',
    memToReg: '0',
    enBR: '1',
    memRead: '0',
    memWrite: '0',
    branch: '0',
    aluOp: '10',
    jump: '0',
    description: 'Opera entre dos registros leídos (rs y rt) y escribe el resultado en un tercer registro (rd).',
    notes: 'RegDst=1 selecciona rd [15:11]. ALU_Src=0 toma DR2. MemToReg=0 toma la salida de la ALU. en_BR=1 permite guardar el resultado.'
  },
  {
    instruction: 'lw (Load Word)',
    assemblyExample: 'lw $t0, 4($s1)',
    format: 'I',
    regDst: '0',
    aluSrc: '1',
    memToReg: '1',
    enBR: '1',
    memRead: '1',
    memWrite: '0',
    branch: '0',
    aluOp: '00',
    jump: '0',
    description: 'Carga una palabra de 32 bits desde memoria hacia el registro rt.',
    notes: 'RegDst=0 elige rt [20:16] como destino. ALU_Src=1 usa el inmediato extendido para calcular Dirección = base + offset. MemRead=1 habilita la lectura. MemToReg=1 envía el dato leído al banco de registros.'
  },
  {
    instruction: 'sw (Store Word)',
    assemblyExample: 'sw $t0, 8($s1)',
    format: 'I',
    regDst: 'X',
    aluSrc: '1',
    memToReg: 'X',
    enBR: '0',
    memRead: '0',
    memWrite: '1',
    branch: '0',
    aluOp: '00',
    jump: '0',
    description: 'Guarda el contenido del registro rt en la memoria de datos en la dirección calculada.',
    notes: 'No escribe en el banco de registros (en_BR=0), por lo que RegDst y MemToReg son "Don\'t Care" (X). MemWrite=1 habilita escribir DR2 en memoria.'
  },
  {
    instruction: 'beq (Branch on Equal)',
    assemblyExample: 'beq $s1, $s2, label',
    format: 'I',
    regDst: 'X',
    aluSrc: '0',
    memToReg: 'X',
    enBR: '0',
    memRead: '0',
    memWrite: '0',
    branch: '1',
    aluOp: '01',
    jump: '0',
    description: 'Compara dos registros mediante resta en la ALU. Si son iguales (zf=1) y Branch=1, salta a la dirección de bifurcación.',
    notes: 'ALU_Op=01 fuerza resta en la ALU. Si DR1 - DR2 == 0, zf se pone en 1. La compuerta AND activa PCSrc=1 para seleccionar el Sumador de Branch en Mux4.'
  },
  {
    instruction: 'j (Jump incondicional)',
    assemblyExample: 'j 0x00400050',
    format: 'J',
    regDst: 'X',
    aluSrc: 'X',
    memToReg: 'X',
    enBR: '0',
    memRead: '0',
    memWrite: '0',
    branch: '0',
    aluOp: 'XX',
    jump: '1',
    description: 'Salto incondicional a la dirección formada por los 4 bits más altos de PC+4 y los 26 bits de índice desplazados 2 bits.',
    notes: 'Jump=1 conmuta Mux5 directamente a {PC+4[31:28], address[25:0]<<2}, ignorando la salida de Mux4. No modifica registros ni memoria.'
  }
]
