export interface InstructionField {
  name: string
  bits: string
  bitRange: string
  color: string
  description: string
  exampleValue: string
  exampleBinary: string
}

export interface InstructionFormatInfo {
  type: 'R' | 'I' | 'J'
  name: string
  syntax: string
  description: string
  totalBits: number
  fields: InstructionField[]
  examples: {
    assembly: string
    hex: string
    binary: string
    meaning: string
  }[]
}

export const INSTRUCTION_FORMATS: InstructionFormatInfo[] = [
  {
    type: 'R',
    name: 'Tipo R (Registro)',
    syntax: 'op rd, rs, rt   (ej: add $t0, $s1, $s2)',
    description: 'Instrucciones donde todos los operandos provienen y van a registros del procesador. Usadas para operaciones aritméticas y lógicas.',
    totalBits: 32,
    fields: [
      {
        name: 'op',
        bits: '6 bits',
        bitRange: '[31:26]',
        color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
        description: 'Código de operación básico. Para todas las instrucciones tipo R es siempre 000000 (0).',
        exampleValue: '0',
        exampleBinary: '000000'
      },
      {
        name: 'rs',
        bits: '5 bits',
        bitRange: '[25:21]',
        color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        description: 'Primer registro fuente (Source register). Conectado al puerto AR1 del Banco de Registros.',
        exampleValue: '17 ($s1)',
        exampleBinary: '10001'
      },
      {
        name: 'rt',
        bits: '5 bits',
        bitRange: '[20:16]',
        color: 'border-blue-500 bg-blue-950/40 text-blue-300',
        description: 'Segundo registro fuente (Target register). Conectado al puerto AR2 del Banco de Registros.',
        exampleValue: '18 ($s2)',
        exampleBinary: '10010'
      },
      {
        name: 'rd',
        bits: '5 bits',
        bitRange: '[15:11]',
        color: 'border-amber-500 bg-amber-950/40 text-amber-300',
        description: 'Registro destino (Destination register). Seleccionado por Mux2 hacia AW cuando RegDst=1.',
        exampleValue: '8 ($t0)',
        exampleBinary: '01000'
      },
      {
        name: 'shamt',
        bits: '5 bits',
        bitRange: '[10:6]',
        color: 'border-purple-500 bg-purple-950/40 text-purple-300',
        description: 'Cantidad de desplazamiento (Shift amount). Se usa en sll, srl. Vale 0 en add, sub, and, or, slt.',
        exampleValue: '0',
        exampleBinary: '00000'
      },
      {
        name: 'funct',
        bits: '6 bits',
        bitRange: '[5:0]',
        color: 'border-pink-500 bg-pink-950/40 text-pink-300',
        description: 'Código de función específico. La ALU Control lo usa para determinar la operación exacta.',
        exampleValue: '32 (add)',
        exampleBinary: '100000'
      }
    ],
    examples: [
      {
        assembly: 'add $t0, $s1, $s2',
        hex: '0x02324020',
        binary: '000000 10001 10010 01000 00000 100000',
        meaning: '$t0 = $s1 + $s2 (Suma los registros 17 y 18, guarda resultado en registro 8)'
      },
      {
        assembly: 'sub $t1, $s1, $s2',
        hex: '0x02324822',
        binary: '000000 10001 10010 01001 00000 100010',
        meaning: '$t1 = $s1 - $s2 (Resta los registros 17 y 18, guarda resultado en registro 9)'
      },
      {
        assembly: 'slt $t2, $s1, $s2',
        hex: '0x0232502A',
        binary: '000000 10001 10010 01010 00000 101010',
        meaning: '$t2 = ($s1 < $s2) ? 1 : 0 (Set on Less Than con signo)'
      }
    ]
  },
  {
    type: 'I',
    name: 'Tipo I (Inmediato)',
    syntax: 'op rt, imm(rs)   (ej: lw $t0, 4($s1))  o  op rs, rt, offset (beq)',
    description: 'Instrucciones que incorporan una constante de 16 bits en la propia instrucción. Usadas para accesos a memoria (lw, sw), operaciones con constantes (addi) y saltos condicionales (beq).',
    totalBits: 32,
    fields: [
      {
        name: 'op',
        bits: '6 bits',
        bitRange: '[31:26]',
        color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
        description: 'Opcode específico: 100011 para lw (35), 101011 para sw (43), 000100 para beq (4).',
        exampleValue: '35 (lw)',
        exampleBinary: '100011'
      },
      {
        name: 'rs',
        bits: '5 bits',
        bitRange: '[25:21]',
        color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
        description: 'Registro base para cálculo de dirección o primer operando de comparación.',
        exampleValue: '17 ($s1)',
        exampleBinary: '10001'
      },
      {
        name: 'rt',
        bits: '5 bits',
        bitRange: '[20:16]',
        color: 'border-blue-500 bg-blue-950/40 text-blue-300',
        description: 'Registro destino (en lw) o registro fuente a escribir en memoria (en sw) o segundo operando (en beq).',
        exampleValue: '8 ($t0)',
        exampleBinary: '01000'
      },
      {
        name: 'inmediato',
        bits: '16 bits',
        bitRange: '[15:0]',
        color: 'border-amber-500 bg-amber-950/40 text-amber-300',
        description: 'Constante u offset con signo (-32768 a +32767). Pasa por el módulo Sign Ext para convertirse a 32 bits.',
        exampleValue: '4',
        exampleBinary: '0000000000000100'
      }
    ],
    examples: [
      {
        assembly: 'lw $t0, 4($s1)',
        hex: '0x8E280004',
        binary: '100011 10001 01000 0000000000000100',
        meaning: 'Carga en $t0 la palabra ubicada en memoria en la dirección ($s1 + 4)'
      },
      {
        assembly: 'sw $t0, 8($s1)',
        hex: '0xAE280008',
        binary: '101011 10001 01000 0000000000001000',
        meaning: 'Almacena en memoria en ($s1 + 8) el valor contenido en $t0'
      },
      {
        assembly: 'beq $s1, $s2, 3',
        hex: '0x12320003',
        binary: '000100 10001 10010 0000000000000011',
        meaning: 'Si $s1 == $s2, salta a PC + 4 + (3 * 4) = PC + 16 bytes'
      }
    ]
  },
  {
    type: 'J',
    name: 'Tipo J (Salto Incondicional)',
    syntax: 'j target   (ej: j 0x00400020)',
    description: 'Instrucciones para saltos incondicionales largos a cualquier posición del segmento actual de 256 MB de código.',
    totalBits: 32,
    fields: [
      {
        name: 'op',
        bits: '6 bits',
        bitRange: '[31:26]',
        color: 'border-cyan-500 bg-cyan-950/40 text-cyan-300',
        description: 'Opcode de salto incondicional: 000010 para j (2).',
        exampleValue: '2 (j)',
        exampleBinary: '000010'
      },
      {
        name: 'índice / target',
        bits: '26 bits',
        bitRange: '[25:0]',
        color: 'border-amber-500 bg-amber-950/40 text-amber-300',
        description: 'Dirección destino en palabras. El módulo Shift Left (jump) la multiplica por 4 (28 bits) y se concatena con los 4 bits superiores de PC+4.',
        exampleValue: '0x00100008',
        exampleBinary: '00000100000000000000001000'
      }
    ],
    examples: [
      {
        assembly: 'j 0x00400020',
        hex: '0x08100008',
        binary: '000010 00000100000000000000001000',
        meaning: 'Salta incondicionalmente a la dirección 0x00400020: Next_PC = {PC+4[31:28], target<<2}'
      }
    ]
  }
]

export interface SimulationStep {
  stepNumber: number
  title: string
  subtitle: string
  explanation: string
  activeComponentIds: string[]
  activeWireIds: string[]
  busValues: Record<string, string>
  controlSignalValues: Record<string, string | number>
}

export interface SimulationScenario {
  id: 'R' | 'lw' | 'sw' | 'beq_taken' | 'beq_nottaken' | 'j'
  instructionName: string
  assembly: string
  format: 'R' | 'I' | 'J'
  hexCode: string
  binaryCode: string
  description: string
  steps: SimulationStep[]
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'R',
    instructionName: 'add $t0, $s1, $s2 (Tipo R)',
    assembly: 'add $t0, $s1, $s2',
    format: 'R',
    hexCode: '0x02324020',
    binaryCode: '000000 10001 10010 01000 00000 100000',
    description: 'Suma el contenido de los registros $s1 (valor 25) y $s2 (valor 15) y guarda el resultado 40 en el registro $t0.',
    steps: [
      {
        stepNumber: 1,
        title: 'Fase 1: Búsqueda (Fetch)',
        subtitle: 'Lectura de instrucción y cálculo de PC+4',
        explanation: 'El registro PC entrega la dirección 0x00400000 a la Memoria de Instrucciones y al Sumador PC+4. La memoria entrega el código binario 0x02324020. Simultáneamente, el Sumador PC+4 calcula 0x00400004.',
        activeComponentIds: ['pc', 'adder_pc4', 'instruction_mem'],
        activeWireIds: ['pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out', 'adder_pc4_to_mux4'],
        busValues: {
          'PC': '0x00400000',
          'PC+4': '0x00400004',
          'Instrucción': '0x02324020'
        },
        controlSignalValues: { en_BR: '-', RegDst: '-', ALU_Src: '-', ALU_Op: '--', MemToReg: '-', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 2,
        title: 'Fase 2: Decodificación y Lectura de Registros (Decode)',
        subtitle: 'Unidad de Control y Banco de Registros',
        explanation: 'La Unidad de Control decodifica op=000000: activa en_BR=1, RegDst=1 y ALU_Op=10. El Banco de Registros lee $s1 (AR1=17, valor 25) y $s2 (AR2=18, valor 15). Mux2 selecciona rd (8, $t0) como AW.',
        activeComponentIds: ['control_unit', 'mux2', 'register_file'],
        activeWireIds: ['instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf', 'instr_rt_to_mux2', 'instr_rd_to_mux2', 'ctrl_regdst', 'mux2_out', 'ctrl_en_br', 'rf_dr1', 'rf_dr2'],
        busValues: {
          'AR1 (rs)': '17 ($s1)',
          'AR2 (rt)': '18 ($s2)',
          'DR1': '25 (0x00000019)',
          'DR2': '15 (0x0000000F)',
          'AW': '8 ($t0)',
          'en_BR': '1'
        },
        controlSignalValues: { en_BR: 1, RegDst: 1, ALU_Src: 0, ALU_Op: '10', MemToReg: 0, MemRead: 0, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 3,
        title: 'Fase 3: Ejecución (Execute)',
        subtitle: 'ALU Control y ALU de 32 bits',
        explanation: 'ALU_Src=0 hace que Mux3 entregue DR2 (15) a la entrada B de la ALU. ALU Control recibe ALU_Op=10 y funct=100000 (add) y emite el código 010 (ADD). La ALU efectúa 25 + 15 = 40. Como 40 != 0, zf=0.',
        activeComponentIds: ['mux3', 'alu_control', 'alu'],
        activeWireIds: ['rf_dr1_to_alu', 'rf_dr2_to_mux3', 'ctrl_alu_src', 'mux3_out', 'instr_funct_to_alu_ctrl', 'ctrl_alu_op', 'alu_ctrl_out', 'alu_out', 'alu_zf'],
        busValues: {
          'ALU Entrada A': '25',
          'ALU Entrada B': '15',
          'ALU Control': '010 (ADD)',
          'ALU Resultado': '40 (0x00000028)',
          'zf': '0'
        },
        controlSignalValues: { en_BR: 1, RegDst: 1, ALU_Src: 0, ALU_Op: '10', MemToReg: 0, MemRead: 0, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 4,
        title: 'Fase 4: Memoria (Memory Stage)',
        subtitle: 'Paso directo por la etapa de memoria (sin acceso a RAM)',
        explanation: 'En instrucciones aritméticas tipo R, la Memoria de Datos no interviene (MemRead=0, MemWrite=0). El resultado 40 de la ALU viaja directo hacia el Mux1 (MemToReg).',
        activeComponentIds: ['alu', 'mux1'],
        activeWireIds: ['alu_out_to_dmem', 'alu_out_to_mux1', 'ctrl_mem_to_reg'],
        busValues: {
          'ALU Resultado': '40',
          'MemRead': '0',
          'MemWrite': '0',
          'MemToReg': '0'
        },
        controlSignalValues: { en_BR: 1, RegDst: 1, ALU_Src: 0, ALU_Op: '10', MemToReg: 0, MemRead: 0, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 5,
        title: 'Fase 5: Escritura en Registros y Siguiente PC (Write-Back)',
        subtitle: 'Escritura de 40 en $t0 y PC <= PC+4',
        explanation: 'MemToReg=0 selecciona el resultado de la ALU (40). Este dato viaja por el bus largo hacia DW del Banco de Registros. Al flanco de subida, como en_BR=1, $t0 recibe el valor 40. Mux4 y Mux5 seleccionan PC+4 (0x00400004) para el siguiente ciclo.',
        activeComponentIds: ['mux1', 'register_file', 'mux4', 'mux5', 'pc'],
        activeWireIds: ['mux1_out_to_dw', 'mux4_out_to_mux5', 'mux5_out_to_pc'],
        busValues: {
          'DW (Dato a escribir)': '40',
          'AW (Registro destino)': '8 ($t0)',
          'Next PC': '0x00400004'
        },
        controlSignalValues: { en_BR: 1, RegDst: 1, ALU_Src: 0, ALU_Op: '10', MemToReg: 0, MemRead: 0, MemWrite: 0, Branch: 0, Jump: 0 }
      }
    ]
  },
  {
    id: 'lw',
    instructionName: 'lw $t0, 4($s1) (Load Word)',
    assembly: 'lw $t0, 4($s1)',
    format: 'I',
    hexCode: '0x8E280004',
    binaryCode: '100011 10001 01000 0000000000000100',
    description: 'Calcula Dirección = $s1 (0x10010000) + 4 = 0x10010004, lee la palabra en esa dirección de memoria (valor 99) y la carga en $t0.',
    steps: [
      {
        stepNumber: 1,
        title: 'Fase 1: Búsqueda (Fetch)',
        subtitle: 'Lectura de instrucción y cálculo de PC+4',
        explanation: 'El PC (0x00400000) apunta a la instrucción lw en la Memoria de Instrucciones. Simultáneamente, el Sumador PC+4 calcula la dirección secuencial 0x00400004.',
        activeComponentIds: ['pc', 'adder_pc4', 'instruction_mem'],
        activeWireIds: ['pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out', 'adder_pc4_to_mux4'],
        busValues: { 'PC': '0x00400000', 'PC+4': '0x00400004', 'Instrucción': '0x8E280004' },
        controlSignalValues: { en_BR: '-', RegDst: 0, ALU_Src: 1, ALU_Op: '00', MemToReg: 1, MemRead: 1, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 2,
        title: 'Fase 2: Decodificación y Extensión de Signo',
        subtitle: 'Lectura de registro base $s1 y extensión de offset a 32 bits',
        explanation: 'La Unidad de Control decodifica op=100011 (lw): activa RegDst=0 (elige rt), ALU_Src=1, MemRead=1, MemToReg=1 y en_BR=1. El Banco de Registros lee $s1 (valor 0x10010000). El módulo Sign Ext convierte el offset 4 (16 bits) a 0x00000004 (32 bits).',
        activeComponentIds: ['control_unit', 'mux2', 'register_file', 'sign_ext'],
        activeWireIds: ['instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_mux2', 'instr_imm_to_sign_ext', 'sign_ext_out', 'ctrl_regdst', 'mux2_out', 'rf_dr1'],
        busValues: {
          'AR1 (base)': '17 ($s1)',
          'DR1 (base valor)': '0x10010000',
          'Inmediato 16b': '4',
          'SignExt Out': '0x00000004',
          'AW': '8 ($t0, rt)'
        },
        controlSignalValues: { en_BR: 1, RegDst: 0, ALU_Src: 1, ALU_Op: '00', MemToReg: 1, MemRead: 1, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 3,
        title: 'Fase 3: Ejecución (Cálculo de Dirección Efectiva)',
        subtitle: 'Suma de base + offset en la ALU',
        explanation: 'ALU_Src=1 selecciona el inmediato extendido (4) en Mux3. ALU Control recibe ALU_Op=00 y configura la ALU para suma (010). La ALU suma 0x10010000 + 4 = 0x10010004.',
        activeComponentIds: ['mux3', 'alu_control', 'alu'],
        activeWireIds: ['rf_dr1_to_alu', 'sign_ext_to_mux3', 'ctrl_alu_src', 'mux3_out', 'ctrl_alu_op', 'alu_ctrl_out', 'alu_out'],
        busValues: {
          'Dirección calculada': '0x10010004',
          'Operación ALU': '010 (ADD)'
        },
        controlSignalValues: { en_BR: 1, RegDst: 0, ALU_Src: 1, ALU_Op: '00', MemToReg: 1, MemRead: 1, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 4,
        title: 'Fase 4: Acceso a Memoria de Datos',
        subtitle: 'Lectura de palabra en la RAM',
        explanation: 'MemRead=1 habilita la lectura en la Memoria de Datos. La memoria lee la dirección 0x10010004 suministrada por la ALU y entrega el dato almacenado (99 / 0x00000063).',
        activeComponentIds: ['data_mem'],
        activeWireIds: ['alu_out_to_dmem', 'ctrl_mem_read', 'dmem_out_to_mux1'],
        busValues: {
          'Address_In': '0x10010004',
          'Dato Leído de Memoria': '99 (0x00000063)'
        },
        controlSignalValues: { en_BR: 1, RegDst: 0, ALU_Src: 1, ALU_Op: '00', MemToReg: 1, MemRead: 1, MemWrite: 0, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 5,
        title: 'Fase 5: Escritura en Registro Destino (Write-Back)',
        subtitle: 'Guardado del dato en $t0',
        explanation: 'MemToReg=1 selecciona el dato leído de memoria (99) en el Mux1. Este dato ingresa por DW al Banco de Registros y se guarda en $t0 (AW=8) gracias a en_BR=1. El PC avanza a 0x00400004.',
        activeComponentIds: ['mux1', 'register_file', 'pc'],
        activeWireIds: ['ctrl_mem_to_reg', 'mux1_out_to_dw', 'mux4_out_to_mux5', 'mux5_out_to_pc'],
        busValues: {
          'DW': '99',
          'AW': '8 ($t0)',
          'Next PC': '0x00400004'
        },
        controlSignalValues: { en_BR: 1, RegDst: 0, ALU_Src: 1, ALU_Op: '00', MemToReg: 1, MemRead: 1, MemWrite: 0, Branch: 0, Jump: 0 }
      }
    ]
  },
  {
    id: 'sw',
    instructionName: 'sw $t0, 8($s1) (Store Word)',
    assembly: 'sw $t0, 8($s1)',
    format: 'I',
    hexCode: '0xAE280008',
    binaryCode: '101011 10001 01000 0000000000001000',
    description: 'Calcula Dirección = $s1 (0x10010000) + 8 = 0x10010008 y escribe el contenido de $t0 (valor 40) en esa dirección de la Memoria de Datos.',
    steps: [
      {
        stepNumber: 1,
        title: 'Fase 1: Búsqueda (Fetch)',
        subtitle: 'Lectura de instrucción sw y PC+4',
        explanation: 'La instrucción sw es leída de la Memoria de Instrucciones en PC (0x00400000). El Sumador PC+4 calcula 0x00400004.',
        activeComponentIds: ['pc', 'adder_pc4', 'instruction_mem'],
        activeWireIds: ['pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out', 'adder_pc4_to_mux4'],
        busValues: { 'PC': '0x00400000', 'PC+4': '0x00400004', 'Instrucción': '0xAE280008' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 1, ALU_Op: '00', MemToReg: 'X', MemRead: 0, MemWrite: 1, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 2,
        title: 'Fase 2: Decodificación y Lectura de Registros',
        subtitle: 'Lectura de base $s1 y dato a guardar $t0',
        explanation: 'La Unidad de Control activa ALU_Src=1, MemWrite=1 y mantiene en_BR=0 (no se modifican registros). El Banco de Registros lee $s1 (AR1=17, base 0x10010000) y $t0 (AR2=8, dato 40). Sign Ext extiende el offset 8 a 32 bits.',
        activeComponentIds: ['control_unit', 'register_file', 'sign_ext'],
        activeWireIds: ['instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf', 'instr_imm_to_sign_ext', 'sign_ext_out', 'rf_dr1', 'rf_dr2'],
        busValues: {
          'DR1 (base)': '0x10010000',
          'DR2 (Data_In)': '40',
          'SignExt Out': '0x00000008'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 1, ALU_Op: '00', MemToReg: 'X', MemRead: 0, MemWrite: 1, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 3,
        title: 'Fase 3: Ejecución (Cálculo de Dirección)',
        subtitle: 'Suma de base + offset en la ALU',
        explanation: 'Mux3 selecciona el offset extendido (8) hacia la entrada B de la ALU. La ALU suma 0x10010000 + 8 = 0x10010008.',
        activeComponentIds: ['mux3', 'alu_control', 'alu'],
        activeWireIds: ['rf_dr1_to_alu', 'sign_ext_to_mux3', 'ctrl_alu_src', 'mux3_out', 'ctrl_alu_op', 'alu_ctrl_out', 'alu_out'],
        busValues: {
          'Dirección Memoria': '0x10010008',
          'Operación ALU': '010 (ADD)'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 1, ALU_Op: '00', MemToReg: 'X', MemRead: 0, MemWrite: 1, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 4,
        title: 'Fase 4: Escritura en Memoria de Datos',
        subtitle: 'Guardado del dato en la RAM',
        explanation: 'MemWrite=1 habilita la escritura. La memoria toma el dato 40 proveniente directamente de DR2 y lo almacena en la dirección 0x10010008 al flanco de subida del reloj.',
        activeComponentIds: ['data_mem'],
        activeWireIds: ['alu_out_to_dmem', 'rf_dr2_to_dmem', 'ctrl_mem_write'],
        busValues: {
          'Address_In': '0x10010008',
          'Data_In': '40',
          'MemWrite': '1'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 1, ALU_Op: '00', MemToReg: 'X', MemRead: 0, MemWrite: 1, Branch: 0, Jump: 0 }
      },
      {
        stepNumber: 5,
        title: 'Fase 5: Actualización del Contador de Programa',
        subtitle: 'PC <= PC+4 (sin escritura en banco de registros)',
        explanation: 'Dado que en_BR=0, el Banco de Registros no se modifica. El PC se actualiza con PC+4 (0x00400004) a través de Mux4 y Mux5.',
        activeComponentIds: ['mux4', 'mux5', 'pc'],
        activeWireIds: ['adder_pc4_to_mux4', 'mux4_out_to_mux5', 'mux5_out_to_pc'],
        busValues: { 'Next PC': '0x00400004' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 1, ALU_Op: '00', MemToReg: 'X', MemRead: 0, MemWrite: 1, Branch: 0, Jump: 0 }
      }
    ]
  },
  {
    id: 'beq_taken',
    instructionName: 'beq $s1, $s2, label (Bifurcación Tomada: Iguales)',
    assembly: 'beq $s1, $s2, 3   # Salto a PC + 4 + 12',
    format: 'I',
    hexCode: '0x12320003',
    binaryCode: '000100 10001 10010 0000000000000011',
    description: 'Compara $s1 (valor 25) y $s2 (valor 25). Como son iguales, zf=1 y la compuerta AND activa PCSrc=1, tomando el salto a la dirección calculada (0x00400010).',
    steps: [
      {
        stepNumber: 1,
        title: 'Fase 1: Búsqueda (Fetch)',
        subtitle: 'Lectura de instrucción beq y PC+4',
        explanation: 'PC entrega 0x00400000 a la Memoria de Instrucciones. El Sumador PC+4 calcula 0x00400004.',
        activeComponentIds: ['pc', 'adder_pc4', 'instruction_mem'],
        activeWireIds: ['pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out', 'adder_pc4_to_mux4', 'adder_pc4_to_adder_br'],
        busValues: { 'PC': '0x00400000', 'PC+4': '0x00400004', 'Instrucción': '0x12320003' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 0, ALU_Op: '01', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 1, Jump: 0 }
      },
      {
        stepNumber: 2,
        title: 'Fase 2: Decodificación y Lectura de Registros a Comparar',
        subtitle: 'Lectura de $s1 y $s2 + Extensión del offset',
        explanation: 'La Unidad de Control activa Branch=1 y ALU_Op=01 (resta). El Banco de Registros lee $s1 (DR1=25) y $s2 (DR2=25). El módulo Sign Ext extiende el offset 3 a 32 bits.',
        activeComponentIds: ['control_unit', 'register_file', 'sign_ext'],
        activeWireIds: ['instr_to_ctrl', 'instr_rs_to_rf', 'instr_rt_to_rf', 'instr_imm_to_sign_ext', 'sign_ext_out', 'ctrl_branch', 'rf_dr1', 'rf_dr2'],
        busValues: {
          'DR1': '25',
          'DR2': '25',
          'Inmediato': '3',
          'Branch Control': '1'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 0, ALU_Op: '01', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 1, Jump: 0 }
      },
      {
        stepNumber: 3,
        title: 'Fase 3: Comparación en ALU y Cálculo de Dirección de Branch',
        subtitle: 'Resta en ALU (25 - 25 = 0 -> zf=1) y PC+4 + (offset << 2)',
        explanation: 'En la ALU: ALU_Src=0 pasa DR2 (25) y la ALU resta 25 - 25 = 0, activando zf=1. Simultáneamente: Shift Left (branch) multiplica el offset 3 por 4 (=12 bytes) y el Sumador de Branch suma 0x00400004 + 12 = 0x00400010.',
        activeComponentIds: ['mux3', 'alu_control', 'alu', 'shift_branch', 'adder_branch'],
        activeWireIds: ['rf_dr1_to_alu', 'rf_dr2_to_mux3', 'mux3_out', 'alu_ctrl_out', 'alu_zf', 'sign_ext_to_shift_br', 'shift_br_out', 'adder_pc4_to_adder_br', 'adder_br_out_to_mux4'],
        busValues: {
          'ALU Resultado': '0',
          'zf (Zero Flag)': '1',
          'Offset desplazado': '12 (3 << 2)',
          'Dirección de Branch': '0x00400010'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 0, ALU_Op: '01', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 1, Jump: 0 }
      },
      {
        stepNumber: 4,
        title: 'Fase 4: Decisión de Bifurcación (Compuerta AND)',
        subtitle: 'PCSrc = Branch (1) AND zf (1) = 1 (Salto Tomado)',
        explanation: 'La Compuerta AND evalúa Branch (1) AND zf (1) = 1. La señal resultante PCSrc=1 conmuta Mux4 hacia la entrada 1 (la dirección destino de branch 0x00400010).',
        activeComponentIds: ['and_gate', 'mux4'],
        activeWireIds: ['ctrl_branch_to_and', 'alu_zf_to_and', 'and_out_to_mux4', 'adder_br_out_to_mux4', 'mux4_out_to_mux5'],
        busValues: {
          'Branch': '1',
          'zf': '1',
          'PCSrc (Salida AND)': '1 (Tomar salto)',
          'Salida Mux4': '0x00400010'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 0, ALU_Op: '01', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 1, Jump: 0 }
      },
      {
        stepNumber: 5,
        title: 'Fase 5: Actualización del PC con la Dirección de Salto',
        subtitle: 'PC <= 0x00400010',
        explanation: 'Dado que Jump=0, Mux5 transmite el resultado de Mux4 (0x00400010) directamente a la entrada next_pc del registro PC. En el siguiente ciclo el procesador ejecutará la instrucción en el destino del branch.',
        activeComponentIds: ['mux5', 'pc'],
        activeWireIds: ['mux4_out_to_mux5', 'mux5_out_to_pc'],
        busValues: { 'Next PC': '0x00400010' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 0, ALU_Op: '01', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 1, Jump: 0 }
      }
    ]
  },
  {
    id: 'j',
    instructionName: 'j 0x00400020 (Salto Incondicional)',
    assembly: 'j 0x00400020',
    format: 'J',
    hexCode: '0x08100008',
    binaryCode: '000010 00000100000000000000001000',
    description: 'Salto incondicional al objetivo absoluto: Next_PC = {PC+4[31:28], target[25:0] << 2} = 0x00400020.',
    steps: [
      {
        stepNumber: 1,
        title: 'Fase 1: Búsqueda (Fetch)',
        subtitle: 'Lectura de instrucción j y PC+4',
        explanation: 'La instrucción j (0x08100008) es leída de la Memoria de Instrucciones. El Sumador PC+4 calcula 0x00400004.',
        activeComponentIds: ['pc', 'adder_pc4', 'instruction_mem'],
        activeWireIds: ['pc_to_imem', 'pc_to_adder_pc4', 'imem_out', 'adder_pc4_out', 'adder_pc4_top_bits'],
        busValues: { 'PC': '0x00400000', 'PC+4': '0x00400004', 'Instrucción': '0x08100008' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 'X', ALU_Op: 'XX', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 1 }
      },
      {
        stepNumber: 2,
        title: 'Fase 2: Decodificación y Desplazamiento del Target',
        subtitle: 'Unidad de Control activa Jump=1 y Shift Left (jump) desplaza 2 bits',
        explanation: 'La Unidad de Control decodifica op=000010 y activa Jump=1. El campo target de 26 bits [25:0] (0x00100008) ingresa al módulo Shift Left (jump), el cual desplaza 2 bits a la izquierda obteniendo 28 bits (0x0400020).',
        activeComponentIds: ['control_unit', 'shift_jump'],
        activeWireIds: ['instr_to_ctrl', 'ctrl_jump', 'instr_jump_to_shift_j', 'shift_jump_out'],
        busValues: {
          'Target [25:0]': '0x00100008',
          'Target << 2 (28 bits)': '0x0400020',
          'Jump Control': '1'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 'X', ALU_Op: 'XX', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 1 }
      },
      {
        stepNumber: 3,
        title: 'Fase 3: Concatenación de Dirección de Salto',
        subtitle: '{PC+4[31:28], target<<2} = {0x0, 0x0400020} = 0x00400020',
        explanation: 'Los 4 bits más significativos de PC+4 [31:28] (4\'b0000) se concatenan con los 28 bits generados por el Shift Left (jump) para formar la dirección completa de salto incondicional de 32 bits: 0x00400020.',
        activeComponentIds: ['shift_jump', 'mux5'],
        activeWireIds: ['adder_pc4_top_bits', 'shift_jump_out', 'jump_target_concat_to_mux5'],
        busValues: {
          'PC+4[31:28]': '4\'b0000',
          'Dirección Final de Jump': '0x00400020'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 'X', ALU_Op: 'XX', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 1 }
      },
      {
        stepNumber: 4,
        title: 'Fase 4: Conmutación en Mux5',
        subtitle: 'Jump=1 conmuta Mux5 hacia la dirección de salto',
        explanation: 'La señal Jump=1 conmuta directamente Mux5 para elegir la dirección de salto calculada (0x00400020), ignorando cualquier resultado proveniente de Mux4.',
        activeComponentIds: ['mux5'],
        activeWireIds: ['ctrl_jump', 'jump_target_concat_to_mux5', 'mux5_out_to_pc'],
        busValues: {
          'Jump': '1',
          'Salida Mux5': '0x00400020'
        },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 'X', ALU_Op: 'XX', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 1 }
      },
      {
        stepNumber: 5,
        title: 'Fase 5: Actualización del Contador de Programa',
        subtitle: 'PC <= 0x00400020',
        explanation: 'La dirección 0x00400020 entra al registro PC. Al siguiente flanco de reloj, el procesador salta directamente a la nueva dirección.',
        activeComponentIds: ['pc'],
        activeWireIds: ['mux5_out_to_pc'],
        busValues: { 'Next PC': '0x00400020' },
        controlSignalValues: { en_BR: 0, RegDst: 'X', ALU_Src: 'X', ALU_Op: 'XX', MemToReg: 'X', MemRead: 0, MemWrite: 0, Branch: 0, Jump: 1 }
      }
    ]
  }
]
