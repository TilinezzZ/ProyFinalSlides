export interface SignalTooltip {
  name: string
  fullName: string
  bitWidth: string
  destination: string
  whenZero: string
  whenOne: string
  whenX?: string
  description: string
  discrepancyNote?: string
}

export const CONTROL_SIGNALS_INFO: Record<string, SignalTooltip> = {
  RegDst: {
    name: 'RegDst',
    fullName: 'Registro Destino (Mux2)',
    bitWidth: '1 bit',
    destination: 'Mux2 (antes del Banco de Registros en puerto AW)',
    whenZero: 'Elige rt [20:16] como registro destino para escribir (usado en lw).',
    whenOne: 'Elige rd [15:11] como registro destino para escribir (usado en instrucciones tipo R).',
    whenX: 'Don\'t Care en sw y beq porque no escriben en el banco de registros.',
    description: 'Determina qué campo de la instrucción especifica el número de registro a escribir.'
  },
  ALUSrc: {
    name: 'ALUSrc',
    fullName: 'Fuente de la ALU (Mux3)',
    bitWidth: '1 bit',
    destination: 'Mux3 (entrada B de la ALU)',
    whenZero: 'El segundo operando de la ALU proviene del Banco de Registros (DR2, registro rt).',
    whenOne: 'El segundo operando proviene del Inmediato extendido con signo de 32 bits (Sign Ext).',
    whenX: 'Don\'t Care en saltos incondicionales j.',
    description: 'Conmuta entre operando de registro (tipo R, beq) u operando inmediato (lw, sw).'
  },
  MemtoReg: {
    name: 'MemtoReg',
    fullName: 'Memoria a Registro (Mux1)',
    bitWidth: '1 bit',
    destination: 'Mux1 (extremo derecho, retroalimentación a DW del Banco de Registros)',
    whenZero: 'El dato a escribir proviene del Resultado de la ALU (instrucciones tipo R).',
    whenOne: 'El dato a escribir proviene de la salida de Lectura de la Memoria de Datos (instrucción lw).',
    whenX: 'Don\'t Care en sw y beq porque no se escribe en ningún registro.',
    description: 'Selecciona la fuente de datos que se guardará en el registro destino.'
  },
  RegWrite: {
    name: 'RegWrite',
    fullName: 'Habilitador de Escritura en Registros (en_BR)',
    bitWidth: '1 bit',
    destination: 'Banco de Registros (puerto en_BR / RegWrite)',
    whenZero: 'No se modifica ningún registro del Banco de Registros.',
    whenOne: 'El dato en DW se escribe en el registro AW en el flanco de subida del reloj.',
    description: 'Permite la escritura en el Banco de Registros.',
    discrepancyNote: 'NOTA: En el Diagrama RTL principal aparece etiquetada como "en_BR" (Enable Banco de Registros), mientras que en la nomenclatura estándar se le llama "RegWrite". Son exactamente la misma señal lógica.'
  },
  MemRead: {
    name: 'MemRead',
    fullName: 'Habilitador de Lectura de Memoria',
    bitWidth: '1 bit',
    destination: 'Memoria de Datos (puerto MemRead)',
    whenZero: 'La memoria de datos no lee ni actualiza su salida.',
    whenOne: 'El contenido de la dirección especificada por Address_In se coloca en la salida de Lectura (usado en lw).',
    description: 'Habilita la lectura asíncrona de datos desde la RAM.'
  },
  MemWrite: {
    name: 'MemWrite',
    fullName: 'Habilitador de Escritura en Memoria',
    bitWidth: '1 bit',
    destination: 'Memoria de Datos (puerto MemWrite)',
    whenZero: 'La memoria no modifica su contenido.',
    whenOne: 'El dato en Data_In (DR2) se escribe en la posición Address_In al flanco de subida (usado en sw).',
    description: 'Permite almacenar una palabra en la memoria de datos.'
  },
  Branch: {
    name: 'Branch',
    fullName: 'Señal de Bifurcación Condicional',
    bitWidth: '1 bit',
    destination: 'Compuerta AND (junto con la bandera zf de la ALU)',
    whenZero: 'No se toma ninguna bifurcación condicional.',
    whenOne: 'Si la ALU detecta igualdad (zf=1), la compuerta AND activa PCSrc=1 para tomar el salto a la dirección calculada (usado en beq).',
    description: 'Indica a la compuerta AND que la instrucción actual es un branch condicional.'
  },
  ALUOp: {
    name: 'ALUOp',
    fullName: 'Código de Operación para ALU Control',
    bitWidth: '2 bits [1:0]',
    destination: 'Módulo ALU Control',
    whenZero: '00: Instrucciones lw / sw -> Fuerza a la ALU a sumar (cálculo de dirección base + offset).',
    whenOne: '01: beq -> Fuerza resta en la ALU para comparar operandos; 10: Tipo R -> Delega en el campo funct.',
    description: 'Informa a ALU Control el tipo general de instrucción para que genere el código específico de 4 bits.'
  },
  Jump: {
    name: 'Jump',
    fullName: 'Salto Incondicional (Mux5)',
    bitWidth: '1 bit',
    destination: 'Mux5 (en la parte superior derecha del datapath)',
    whenZero: 'El siguiente PC se toma de Mux4 (PC+4 o dirección de Branch).',
    whenOne: 'El siguiente PC se toma directamente de la dirección de salto {PC+4[31:28], target<<2} (usado en j).',
    description: 'Fuerza la carga de la dirección absoluta de salto incondicional.'
  }
}

export interface ControlMatrixRow {
  instruction: string
  label: string
  opcode: string
  regDst: '0' | '1' | 'X'
  aluSrc: '0' | '1' | 'X'
  memToReg: '0' | '1' | 'X'
  regWrite: '0' | '1'
  memRead: '0' | '1'
  memWrite: '0' | '1'
  branch: '0' | '1'
  aluOp1: '0' | '1' | 'X'
  aluOp0: '0' | '1' | 'X'
  jump: '0' | '1'
  notes: string
}

export const CONTROL_SIGNALS_MATRIX: ControlMatrixRow[] = [
  {
    instruction: 'R-format',
    label: 'Tipo R (add, sub, and, or, slt)',
    opcode: '000000',
    regDst: '1',
    aluSrc: '0',
    memToReg: '0',
    regWrite: '1',
    memRead: '0',
    memWrite: '0',
    branch: '0',
    aluOp1: '1',
    aluOp0: '0',
    jump: '0',
    notes: 'RegDst=1 (destino rd), ALUSrc=0 (segundo operando DR2), MemtoReg=0 (salida ALU hacia DW), RegWrite=1 (en_BR=1).'
  },
  {
    instruction: 'lw',
    label: 'lw (Load Word)',
    opcode: '100011',
    regDst: '0',
    aluSrc: '1',
    memToReg: '1',
    regWrite: '1',
    memRead: '1',
    memWrite: '0',
    branch: '0',
    aluOp1: '0',
    aluOp0: '0',
    jump: '0',
    notes: 'RegDst=0 (destino rt), ALUSrc=1 (inmediato extendido), MemRead=1 (lectura RAM), MemtoReg=1 (dato leído a registro), RegWrite=1.'
  },
  {
    instruction: 'sw',
    label: 'sw (Store Word)',
    opcode: '101011',
    regDst: 'X',
    aluSrc: '1',
    memToReg: 'X',
    regWrite: '0',
    memRead: '0',
    memWrite: '1',
    branch: '0',
    aluOp1: '0',
    aluOp0: '0',
    jump: '0',
    notes: 'RegWrite=0 (no altera registros, por eso RegDst y MemtoReg son X), ALUSrc=1 (suma offset), MemWrite=1 (guarda en memoria).'
  },
  {
    instruction: 'beq',
    label: 'beq (Branch on Equal)',
    opcode: '000100',
    regDst: 'X',
    aluSrc: '0',
    memToReg: 'X',
    regWrite: '0',
    memRead: '0',
    memWrite: '0',
    branch: '1',
    aluOp1: '0',
    aluOp0: '1',
    jump: '0',
    notes: 'Branch=1, ALUSrc=0 (compara registros DR1 y DR2), ALUOp=01 (resta), RegWrite=0 (no escribe en banco de registros).'
  },
  {
    instruction: 'j',
    label: 'j (Jump Incondicional)',
    opcode: '000010',
    regDst: 'X',
    aluSrc: 'X',
    memToReg: 'X',
    regWrite: '0',
    memRead: '0',
    memWrite: '0',
    branch: '0',
    aluOp1: 'X',
    aluOp0: 'X',
    jump: '1',
    notes: 'Jump=1 conmuta Mux5 directamente a {PC+4[31:28], target<<2}. Todas las demás señales son inactivas o don\'t care.'
  }
]

export interface TruthTableRow {
  instruction: string
  op5: string
  op4: string
  op3: string
  op2: string
  op1: string
  op0: string
  regDst: string
  aluSrc: string
  memToReg: string
  regWrite: string
  memRead: string
  memWrite: string
  branch: string
  aluOp: string
}

export const TRUTH_TABLE_OPCODES: TruthTableRow[] = [
  {
    instruction: 'R-format',
    op5: '0', op4: '0', op3: '0', op2: '0', op1: '0', op0: '0',
    regDst: '1', aluSrc: '0', memToReg: '0', regWrite: '1', memRead: '0', memWrite: '0', branch: '0', aluOp: '10'
  },
  {
    instruction: 'lw',
    op5: '1', op4: '0', op3: '0', op2: '0', op1: '1', op0: '1',
    regDst: '0', aluSrc: '1', memToReg: '1', regWrite: '1', memRead: '1', memWrite: '0', branch: '0', aluOp: '00'
  },
  {
    instruction: 'sw',
    op5: '1', op4: '0', op3: '1', op2: '0', op1: '1', op0: '1',
    regDst: 'X', aluSrc: '1', memToReg: 'X', regWrite: '0', memRead: '0', memWrite: '1', branch: '0', aluOp: '00'
  },
  {
    instruction: 'beq',
    op5: '0', op4: '0', op3: '0', op2: '1', op1: '0', op0: '0',
    regDst: 'X', aluSrc: '0', memToReg: 'X', regWrite: '0', memRead: '0', memWrite: '0', branch: '1', aluOp: '01'
  },
  {
    instruction: 'j',
    op5: '0', op4: '0', op3: '0', op2: '0', op1: '1', op0: '0',
    regDst: 'X', aluSrc: 'X', memToReg: 'X', regWrite: '0', memRead: '0', memWrite: '0', branch: '0', aluOp: 'XX'
  }
]

export interface AluControlTableRow {
  instruction: string
  aluOp: string
  funct: string
  action: string
  aluControl4Bit: string
  aluControl3BitRTL: string
  description: string
}

export const ALU_CONTROL_TABLE: AluControlTableRow[] = [
  {
    instruction: 'lw',
    aluOp: '00',
    funct: 'XXXXXX',
    action: 'add',
    aluControl4Bit: '0010',
    aluControl3BitRTL: '010',
    description: 'Suma el registro base con el offset para calcular la dirección efectiva.'
  },
  {
    instruction: 'sw',
    aluOp: '00',
    funct: 'XXXXXX',
    action: 'add',
    aluControl4Bit: '0010',
    aluControl3BitRTL: '010',
    description: 'Suma el registro base con el offset para calcular la dirección de almacenamiento.'
  },
  {
    instruction: 'beq',
    aluOp: '01',
    funct: 'XXXXXX',
    action: 'subtract',
    aluControl4Bit: '0110',
    aluControl3BitRTL: '110',
    description: 'Resta ambos registros para verificar igualdad mediante zf = (resultado == 0).'
  },
  {
    instruction: 'R-type add',
    aluOp: '10',
    funct: '100000',
    action: 'add',
    aluControl4Bit: '0010',
    aluControl3BitRTL: '010',
    description: 'Suma aritmética entera de 32 bits entre operandos A y B.'
  },
  {
    instruction: 'R-type sub',
    aluOp: '10',
    funct: '100010',
    action: 'subtract',
    aluControl4Bit: '0110',
    aluControl3BitRTL: '110',
    description: 'Resta aritmética entera (A - B).'
  },
  {
    instruction: 'R-type AND',
    aluOp: '10',
    funct: '100100',
    action: 'AND',
    aluControl4Bit: '0000',
    aluControl3BitRTL: '000',
    description: 'Operación lógica AND bit a bit.'
  },
  {
    instruction: 'R-type OR',
    aluOp: '10',
    funct: '100101',
    action: 'OR',
    aluControl4Bit: '0001',
    aluControl3BitRTL: '001',
    description: 'Operación lógica OR bit a bit.'
  },
  {
    instruction: 'R-type slt',
    aluOp: '10',
    funct: '101010',
    action: 'set on less than',
    aluControl4Bit: '0111',
    aluControl3BitRTL: '111',
    description: 'Compara si A < B con signo: entrega 1 si verdadero, 0 si falso.'
  }
]

export interface QuizQuestion {
  id: number
  question: string
  options: { label: string; text: string; correct: boolean }[]
  explanation: string
}

export const CONTROL_UNIT_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: '¿Qué valor toma la señal MemtoReg durante la ejecución de la instrucción lw?',
    options: [
      { label: 'A', text: '0 (toma el resultado de la ALU)', correct: false },
      { label: 'B', text: '1 (toma el dato leído de la Memoria de Datos)', correct: true },
      { label: 'C', text: 'X (Don\'t Care)', correct: false }
    ],
    explanation: 'Correcto. En lw se desea guardar en el registro destino el dato recuperado de la RAM, por lo que Mux1 debe conmutar a 1 (MemtoReg=1).'
  },
  {
    id: 2,
    question: '¿Por qué la señal RegDst vale X (Don\'t Care) en la instrucción sw?',
    options: [
      { label: 'A', text: 'Porque sw nunca escribe en el Banco de Registros (RegWrite=0 / en_BR=0)', correct: true },
      { label: 'B', text: 'Porque sw siempre escribe en el registro $zero', correct: false },
      { label: 'C', text: 'Porque se decide mediante el campo funct', correct: false }
    ],
    explanation: 'Correcto. Como sw solo escribe en la memoria RAM y mantiene RegWrite=0, el valor que seleccione Mux2 en el puerto AW es irrelevante (X).'
  },
  {
    id: 3,
    question: '¿Qué valor tiene ALUOp en la instrucción beq y qué operación fuerza en la ALU?',
    options: [
      { label: 'A', text: 'ALUOp = 00, fuerza una suma', correct: false },
      { label: 'B', text: 'ALUOp = 10, depende del campo funct', correct: false },
      { label: 'C', text: 'ALUOp = 01, fuerza una resta (SUB) para probar si el resultado es 0', correct: true }
    ],
    explanation: 'Correcto. beq utiliza la resta para verificar igualdad: si DR1 - DR2 == 0, la ALU activa la bandera zf (Zero Flag).'
  },
  {
    id: 4,
    question: '¿Qué diferencia existe entre la señal "en_BR" del Diagrama RTL y "RegWrite" en la nomenclatura estándar?',
    options: [
      { label: 'A', text: 'Son señales completamente distintas con diferente función', correct: false },
      { label: 'B', text: 'Son exactamente la misma señal de habilitación de escritura en registros con diferente nombre', correct: true },
      { label: 'C', text: 'en_BR es de 2 bits y RegWrite es de 1 bit', correct: false }
    ],
    explanation: 'Correcto. "en_BR" (Enable Banco de Registros) en español es sinónimo de "RegWrite" en inglés.'
  }
]
