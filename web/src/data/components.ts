export interface Port {
  name: string
  bits: string
  description: string
  isControl?: boolean
}

export interface DatapathComponent {
  id: string
  name: string
  shortLabel: string
  category: 'fetch' | 'decode' | 'execute' | 'memory' | 'writeback' | 'branch_jump' | 'control'
  categoryName: string
  description: string
  purpose: string
  inputs: Port[]
  outputs: Port[]
  instructions: ('R' | 'lw' | 'sw' | 'beq' | 'j')[]
  verilogCode: string
  verilogFileName: string
  hint: string
  slotCoordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

export const COMPONENTS: DatapathComponent[] = [
  {
    id: 'pc',
    name: 'PC',
    shortLabel: 'PC',
    category: 'fetch',
    categoryName: 'Búsqueda (Fetch)',
    description: 'Contador de Programa (Program Counter). Registro de 32 bits que almacena la dirección de memoria de la instrucción que se ejecutará en el ciclo actual.',
    purpose: 'Apunta a la instrucción actual y se actualiza en cada flanco de reloj con la siguiente dirección calculada.',
    inputs: [
      { name: 'CLK', bits: '1 bit', description: 'Señal de reloj que sincroniza la actualización del registro', isControl: true },
      { name: 'rst', bits: '1 bit', description: 'Reset sincrónico/asincrónico para inicializar en 0x00400000', isControl: true },
      { name: 'next_pc', bits: '32 bits [31:0]', description: 'Siguiente dirección calculada (PC+4, Branch o Jump)' }
    ],
    outputs: [
      { name: 'PC', bits: '32 bits [31:0]', description: 'Dirección actual de instrucción hacia Memoria de Instrucciones y Sumadores' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'pc.v',
    verilogCode: `// Módulo PC (Program Counter)
module pc (
    input wire clk,
    input wire rst,
    input wire [31:0] next_pc,
    output reg [31:0] pc
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            pc <= 32'h00400000; // Dirección base estándar
        else
            pc <= next_pc;
    end
endmodule`,
    hint: 'Se ubica al extremo izquierdo. Es el registro de 32 bits que marca el inicio de todo el flujo y recibe CLK.',
    slotCoordinates: { x: 40, y: 320, width: 80, height: 110 }
  },
  {
    id: 'adder_pc4',
    name: 'Sumador PC+4',
    shortLabel: 'PC + 4',
    category: 'fetch',
    categoryName: 'Búsqueda (Fetch)',
    description: 'Sumador combinacional dedicado que calcula la siguiente dirección secuencial sumando 4 bytes (32 bits) al valor actual del PC.',
    purpose: 'En arquitecturas MIPS de 32 bits con direccionamiento por bytes, cada instrucción mide 4 bytes. Sumar 4 permite leer la instrucción secuencial siguiente.',
    inputs: [
      { name: 'PC', bits: '32 bits [31:0]', description: 'Dirección del PC actual' },
      { name: 'Constante 4', bits: '32 bits', description: 'Valor constante 32\'d4' }
    ],
    outputs: [
      { name: 'PC+4', bits: '32 bits [31:0]', description: 'Dirección secuencial siguiente (PC + 4)' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'adder_pc4.v',
    verilogCode: `// Sumador PC+4 dedicado
module adder_pc4 (
    input wire [31:0] pc,
    output wire [31:0] pc_plus_4
);
    assign pc_plus_4 = pc + 32'd4;
endmodule`,
    hint: 'Se coloca justo arriba del PC para computar la dirección secuencial siguiente sumándole 4.',
    slotCoordinates: { x: 180, y: 150, width: 85, height: 95 }
  },
  {
    id: 'instruction_mem',
    name: 'Memoria de Instrucciones',
    shortLabel: 'Mem. Instr.',
    category: 'fetch',
    categoryName: 'Búsqueda (Fetch)',
    description: 'Memoria ROM combinacional que almacena el código máquina del programa. A partir de la dirección suministrada por el PC, entrega la palabra de instrucción completa de 32 bits.',
    purpose: 'Recuperar la instrucción a ejecutar durante la fase de Fetch.',
    inputs: [
      { name: 'PC (Address)', bits: '32 bits [31:0]', description: 'Dirección de memoria suministrada por el PC' }
    ],
    outputs: [
      { name: 'Instrucción', bits: '32 bits [31:0]', description: 'Código binario de la instrucción de 32 bits' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'instruction_mem.v',
    verilogCode: `// Memoria de Instrucciones (ROM asíncrona)
module instruction_mem (
    input wire [31:0] addr,
    output wire [31:0] instruction
);
    reg [31:0] rom [0:255]; // 256 palabras de 32 bits

    // Alineación a palabra: divide entre 4
    assign instruction = rom[addr[31:2]];
endmodule`,
    hint: 'Recibe la salida directa del PC y entrega la instrucción completa de 32 bits dividida en campos.',
    slotCoordinates: { x: 170, y: 320, width: 110, height: 130 }
  },
  {
    id: 'control_unit',
    name: 'Unidad de Control',
    shortLabel: 'Unidad Control',
    category: 'control',
    categoryName: 'Control Central',
    description: 'Decodificador principal del procesador. Inspecciona los 6 bits de opcode [31:26] de la instrucción y genera todas las señales de control para multiplexores, memorias y registros.',
    purpose: 'Coordinar las acciones de todos los componentes del datapath según el tipo de instrucción.',
    inputs: [
      { name: 'op [31:26]', bits: '6 bits', description: 'Código de operación extraído de los bits 31 al 26' }
    ],
    outputs: [
      { name: 'en_BR', bits: '1 bit', description: 'Habilita escritura en Banco de Registros (RegWrite)', isControl: true },
      { name: 'RegDst', bits: '1 bit', description: 'Selecciona registro destino: 0=rt [20:16], 1=rd [15:11]', isControl: true },
      { name: 'ALU_Src', bits: '1 bit', description: 'Selecciona entrada B de ALU: 0=DR2, 1=SignExt', isControl: true },
      { name: 'ALU Op', bits: '2 bits [1:0]', description: 'Define tipo de operación para ALU Control (00=suma lw/sw, 01=resta beq, 10=R-type)', isControl: true },
      { name: 'MemToReg', bits: '1 bit', description: 'Selecciona dato a escribir en BR: 0=ALU, 1=Memoria', isControl: true },
      { name: 'MemRead', bits: '1 bit', description: 'Habilita lectura en Memoria de Datos', isControl: true },
      { name: 'MemWrite', bits: '1 bit', description: 'Habilita escritura en Memoria de Datos', isControl: true },
      { name: 'Branch', bits: '1 bit', description: 'Indica si es instrucción de salto condicional beq', isControl: true },
      { name: 'Jump', bits: '1 bit', description: 'Indica si es salto incondicional j', isControl: true }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'control_unit.v',
    verilogCode: `// Unidad de Control Principal
module control_unit (
    input wire [5:0] op,
    output reg en_BR,
    output reg RegDst,
    output reg ALU_Src,
    output reg [1:0] ALU_Op,
    output reg MemToReg,
    output reg MemRead,
    output reg MemWrite,
    output reg Branch,
    output reg Jump
);
    always @(*) begin
        // Valores por defecto
        {en_BR, RegDst, ALU_Src, ALU_Op, MemToReg, MemRead, MemWrite, Branch, Jump} = 10'b0;
        case (op)
            6'b000000: begin // Tipo R
                en_BR    = 1'b1;
                RegDst   = 1'b1;
                ALU_Op   = 2'b10;
            end
            6'b100011: begin // lw
                en_BR    = 1'b1;
                ALU_Src  = 1'b1;
                MemToReg = 1'b1;
                MemRead  = 1'b1;
            end
            6'b101011: begin // sw
                ALU_Src  = 1'b1;
                MemWrite = 1'b1;
            end
            6'b000100: begin // beq
                Branch   = 1'b1;
                ALU_Op   = 2'b01;
            end
            6'b000010: begin // j
                Jump     = 1'b1;
            end
            default: ;
        endcase
    end
endmodule`,
    hint: 'Se ubica en la parte superior media. Recibe el campo op [31:26] y emite las 9 señales de control principales.',
    slotCoordinates: { x: 340, y: 80, width: 120, height: 160 }
  },
  {
    id: 'mux2',
    name: 'Mux2 (RegDst)',
    shortLabel: 'Mux2 RegDst',
    category: 'decode',
    categoryName: 'Decodificación',
    description: 'Multiplexor 2 a 1 de 5 bits controlado por la señal RegDst. Elige qué campo de la instrucción especifica la dirección de escritura (AW) en el Banco de Registros.',
    purpose: 'Para instrucciones tipo R elige rd [15:11]; para instrucciones tipo I (como lw) elige rt [20:16].',
    inputs: [
      { name: 'rt [20:16]', bits: '5 bits', description: 'Entrada 0: Especificador de registro rt' },
      { name: 'rd [15:11]', bits: '5 bits', description: 'Entrada 1: Especificador de registro rd' },
      { name: 'RegDst', bits: '1 bit', description: 'Señal de control: 0 elige rt, 1 elige rd', isControl: true }
    ],
    outputs: [
      { name: 'AW', bits: '5 bits [4:0]', description: 'Dirección del registro de destino para el Banco de Registros' }
    ],
    instructions: ['R', 'lw'],
    verilogFileName: 'mux2.v',
    verilogCode: `// Mux2: Selector de registro destino (RegDst)
module mux2 (
    input wire [4:0] rt,
    input wire [4:0] rd,
    input wire reg_dst,
    output wire [4:0] aw
);
    assign aw = reg_dst ? rd : rt;
endmodule`,
    hint: 'Se ubica inmediatamente a la izquierda del puerto AW del Banco de Registros. Conmuta entre rt [20:16] y rd [15:11].',
    slotCoordinates: { x: 330, y: 440, width: 45, height: 80 }
  },
  {
    id: 'register_file',
    name: 'Banco de Registros',
    shortLabel: 'Banco Regs',
    category: 'decode',
    categoryName: 'Decodificación',
    description: 'Conjunto de 32 registros de propósito general de 32 bits ($zero a $ra). Permite la lectura simultánea de dos registros (DR1 y DR2) de forma asíncrona y la escritura sincronizada al flanco de reloj cuando en_BR=1.',
    purpose: 'Almacenar temporalmente los operandos y resultados de las instrucciones.',
    inputs: [
      { name: 'AR1 [25:21]', bits: '5 bits', description: 'Dirección de lectura del Registro 1 (rs)' },
      { name: 'AR2 [20:16]', bits: '5 bits', description: 'Dirección de lectura del Registro 2 (rt)' },
      { name: 'AW', bits: '5 bits [4:0]', description: 'Dirección de registro a escribir (desde Mux2)' },
      { name: 'DW', bits: '32 bits [31:0]', description: 'Dato de 32 bits a escribir (desde Mux1)' },
      { name: 'en_BR', bits: '1 bit', description: 'Habilitador de escritura en registros (RegWrite)', isControl: true },
      { name: 'CLK', bits: '1 bit', description: 'Reloj del sistema', isControl: true }
    ],
    outputs: [
      { name: 'DR1', bits: '32 bits [31:0]', description: 'Dato leído del registro AR1 (rs)' },
      { name: 'DR2', bits: '32 bits [31:0]', description: 'Dato leído del registro AR2 (rt)' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq'],
    verilogFileName: 'register_file.v',
    verilogCode: `// Banco de Registros (32 registros x 32 bits)
module register_file (
    input wire clk,
    input wire en_BR,
    input wire [4:0] AR1,
    input wire [4:0] AR2,
    input wire [4:0] AW,
    input wire [31:0] DW,
    output wire [31:0] DR1,
    output wire [31:0] DR2
);
    reg [31:0] regs [0:31];

    // Lectura asíncrona ($0 siempre vale 0)
    assign DR1 = (AR1 == 5'd0) ? 32'd0 : regs[AR1];
    assign DR2 = (AR2 == 5'd0) ? 32'd0 : regs[AR2];

    // Escritura sincrónica
    always @(posedge clk) begin
        if (en_BR && (AW != 5'd0)) begin
            regs[AW] <= DW;
        end
    end
endmodule`,
    hint: 'Bloque central amplio con entradas AR1, AR2, AW, DW y salidas DR1 y DR2.',
    slotCoordinates: { x: 410, y: 310, width: 120, height: 170 }
  },
  {
    id: 'sign_ext',
    name: 'Sign Ext',
    shortLabel: 'Sign Ext',
    category: 'decode',
    categoryName: 'Decodificación',
    description: 'Extensor de signo. Toma el campo inmediato de 16 bits [15:0] y replica el bit más significativo (bit 15) en los 16 bits superiores para obtener un número con signo de 32 bits.',
    purpose: 'Preservar el valor con signo del offset o inmediato en operaciones aritméticas y saltos.',
    inputs: [
      { name: 'In [15:0]', bits: '16 bits', description: 'Inmediato de 16 bits extraído de la instrucción' }
    ],
    outputs: [
      { name: 'Out [31:0]', bits: '32 bits', description: 'Inmediato extendido con signo a 32 bits' }
    ],
    instructions: ['lw', 'sw', 'beq'],
    verilogFileName: 'sign_ext.v',
    verilogCode: `// Extensor de signo 16 a 32 bits
module sign_ext (
    input wire [15:0] in,
    output wire [31:0] out
);
    // Replica el bit 15 en los 16 bits superiores
    assign out = {{16{in[15]}}, in};
endmodule`,
    hint: 'Se ubica abajo del Banco de Registros. Convierte el inmediato de 16 bits a 32 bits replicando el bit de signo.',
    slotCoordinates: { x: 410, y: 520, width: 90, height: 70 }
  },
  {
    id: 'mux3',
    name: 'Mux3 (ALU_Src)',
    shortLabel: 'Mux3 ALUSrc',
    category: 'execute',
    categoryName: 'Ejecución',
    description: 'Multiplexor 2 a 1 de 32 bits controlado por ALU_Src. Selecciona el segundo operando (entrada B) que alimentará a la ALU.',
    purpose: 'Para instrucciones tipo R selecciona DR2 (segundo registro); para lw y sw selecciona el inmediato extendido.',
    inputs: [
      { name: 'DR2', bits: '32 bits [31:0]', description: 'Entrada 0: Salida del segundo registro leído' },
      { name: 'SignExt', bits: '32 bits [31:0]', description: 'Entrada 1: Inmediato extendido con signo' },
      { name: 'ALU_Src', bits: '1 bit', description: 'Control: 0 elige DR2, 1 elige SignExt', isControl: true }
    ],
    outputs: [
      { name: 'ALU_B', bits: '32 bits [31:0]', description: 'Segundo operando para la ALU' }
    ],
    instructions: ['R', 'lw', 'sw'],
    verilogFileName: 'mux3.v',
    verilogCode: `// Mux3: Selector de entrada B para ALU (ALU_Src)
module mux3 (
    input wire [31:0] dr2,
    input wire [31:0] sign_ext,
    input wire alu_src,
    output wire [31:0] b
);
    assign b = alu_src ? sign_ext : dr2;
endmodule`,
    hint: 'Se ubica justo enfrente de la entrada inferior de la ALU. Elige entre DR2 y el inmediato extendido.',
    slotCoordinates: { x: 570, y: 410, width: 45, height: 85 }
  },
  {
    id: 'alu_control',
    name: 'ALU Control',
    shortLabel: 'ALU Control',
    category: 'control',
    categoryName: 'Control Central',
    description: 'Unidad de control local de la ALU. Combina la señal ALU Op de 2 bits (emitida por la Unidad de Control) con el campo funct de 6 bits [5:0] para generar el código de operación de 3 bits de la ALU.',
    purpose: 'Permite decodificar las diferentes operaciones aritmético-lógicas (ADD, SUB, AND, OR, SLT, NOR) de las instrucciones tipo R.',
    inputs: [
      { name: 'funct [5:0]', bits: '6 bits', description: 'Campo de función de la instrucción (bits 5 al 0)' },
      { name: 'ALU Op', bits: '2 bits [1:0]', description: 'Código preliminar de operación emitido por la Unidad de Control', isControl: true }
    ],
    outputs: [
      { name: 'Operación ALU', bits: '3 bits [2:0]', description: 'Líneas de control específicas para la ALU', isControl: true }
    ],
    instructions: ['R', 'lw', 'sw', 'beq'],
    verilogFileName: 'alu_control.v',
    verilogCode: `// Unidad ALU Control
module alu_control (
    input wire [1:0] alu_op,
    input wire [5:0] funct,
    output reg [2:0] alu_ctrl
);
    always @(*) begin
        case (alu_op)
            2'b00: alu_ctrl = 3'b010; // lw/sw -> ADD
            2'b01: alu_ctrl = 3'b110; // beq   -> SUB
            2'b10: begin             // Tipo R según funct
                case (funct)
                    6'b100000: alu_ctrl = 3'b010; // add
                    6'b100010: alu_ctrl = 3'b110; // sub
                    6'b100100: alu_ctrl = 3'b000; // and
                    6'b100101: alu_ctrl = 3'b001; // or
                    6'b101010: alu_ctrl = 3'b111; // slt
                    default:   alu_ctrl = 3'b010;
                endcase
            end
            default: alu_ctrl = 3'b010;
        endcase
    end
endmodule`,
    hint: 'Se ubica debajo de la ALU. Recibe el campo funct [5:0] y ALU Op para generar los 3 bits de control de la ALU.',
    slotCoordinates: { x: 620, y: 520, width: 95, height: 75 }
  },
  {
    id: 'alu',
    name: 'ALU',
    shortLabel: 'ALU',
    category: 'execute',
    categoryName: 'Ejecución',
    description: 'Unidad Aritmética Lógica de 32 bits. Realiza operaciones aritméticas (suma, resta) y lógicas (AND, OR, SLT, NOR) entre las entradas A y B, y activa la bandera zf (Zero Flag) si el resultado es igual a cero.',
    purpose: 'Calcular operaciones matemáticas, direcciones efectivas de memoria (base + offset) y comparaciones de igualdad (resta para beq).',
    inputs: [
      { name: 'A', bits: '32 bits [31:0]', description: 'Primer operando (proviene de DR1)' },
      { name: 'B', bits: '32 bits [31:0]', description: 'Segundo operando (proviene de Mux3)' },
      { name: 'Control', bits: '3 bits [2:0]', description: 'Código de operación proveniente de ALU Control', isControl: true }
    ],
    outputs: [
      { name: 'Resultado', bits: '32 bits [31:0]', description: 'Resultado aritmético o lógico de 32 bits' },
      { name: 'zf', bits: '1 bit', description: 'Zero Flag: 1 si el Resultado es exactamente 0; de lo contrario 0', isControl: true }
    ],
    instructions: ['R', 'lw', 'sw', 'beq'],
    verilogFileName: 'alu.v',
    verilogCode: `// ALU de 32 bits con bandera Zero Flag (zf)
module alu (
    input wire [31:0] a,
    input wire [31:0] b,
    input wire [2:0] alu_ctrl,
    output reg [31:0] result,
    output wire zf
);
    always @(*) begin
        case (alu_ctrl)
            3'b000: result = a & b;              // AND
            3'b001: result = a | b;              // OR
            3'b010: result = a + b;              // ADD
            3'b110: result = a - b;              // SUB
            3'b111: result = ($signed(a) < $signed(b)) ? 32'd1 : 32'd0; // SLT
            3'b100: result = ~(a | b);           // NOR
            default: result = 32'd0;
        endcase
    end

    // Bandera Zero Flag: 1 si todos los bits son cero
    assign zf = (result == 32'd0);
endmodule`,
    hint: 'La clásica forma geométrica angular en el centro derecho. Recibe DR1 y Mux3, produciendo Resultado y zf.',
    slotCoordinates: { x: 650, y: 340, width: 95, height: 130 }
  },
  {
    id: 'data_mem',
    name: 'Memoria de Datos',
    shortLabel: 'Mem. Datos',
    category: 'memory',
    categoryName: 'Memoria',
    description: 'Memoria RAM de lectura/escritura de 32 bits. Permite leer datos cargados con la instrucción lw y almacenar palabras con la instrucción sw en la dirección indicada por la ALU.',
    purpose: 'Almacenar variables, arreglos y datos en memoria principal.',
    inputs: [
      { name: 'Address_In', bits: '32 bits [31:0]', description: 'Dirección de memoria calculada por la ALU' },
      { name: 'Data_In', bits: '32 bits [31:0]', description: 'Dato a escribir proveniente de DR2' },
      { name: 'MemRead', bits: '1 bit', description: 'Habilitador de lectura', isControl: true },
      { name: 'MemWrite', bits: '1 bit', description: 'Habilitador de escritura sincronizado al reloj', isControl: true },
      { name: 'CLK', bits: '1 bit', description: 'Reloj del sistema', isControl: true }
    ],
    outputs: [
      { name: 'Lectura', bits: '32 bits [31:0]', description: 'Dato de 32 bits leído de la memoria' }
    ],
    instructions: ['lw', 'sw'],
    verilogFileName: 'data_mem.v',
    verilogCode: `// Memoria de Datos (RAM síncrona en escritura, asíncrona en lectura)
module data_mem (
    input wire clk,
    input wire mem_read,
    input wire mem_write,
    input wire [31:0] addr,
    input wire [31:0] data_in,
    output wire [31:0] data_out
);
    reg [31:0] ram [0:255]; // 256 palabras

    // Lectura
    assign data_out = (mem_read) ? ram[addr[31:2]] : 32'd0;

    // Escritura sincrónica al flanco de subida
    always @(posedge clk) begin
        if (mem_write) begin
            ram[addr[31:2]] <= data_in;
        end
    end
endmodule`,
    hint: 'Bloque rectangular a la derecha de la ALU. Recibe Address_In desde la ALU y Data_In desde DR2.',
    slotCoordinates: { x: 800, y: 340, width: 110, height: 140 }
  },
  {
    id: 'mux1',
    name: 'Mux1 (MemToReg)',
    shortLabel: 'Mux1 MemToReg',
    category: 'writeback',
    categoryName: 'Escritura (Writeback)',
    description: 'Multiplexor 2 a 1 de 32 bits controlado por la señal MemToReg. Selecciona el dato que será devuelto y escrito en el puerto DW del Banco de Registros.',
    purpose: 'Elige entre el resultado calculado por la ALU (para instrucciones tipo R) y el dato leído de memoria (para lw).',
    inputs: [
      { name: 'ALU Result', bits: '32 bits [31:0]', description: 'Entrada 0: Resultado aritmético/lógico de la ALU' },
      { name: 'Mem Data', bits: '32 bits [31:0]', description: 'Entrada 1: Dato leído de la Memoria de Datos' },
      { name: 'MemToReg', bits: '1 bit', description: 'Señal de control: 0 elige ALU Result, 1 elige Mem Data', isControl: true }
    ],
    outputs: [
      { name: 'DW', bits: '32 bits [31:0]', description: 'Dato final hacia el puerto DW del Banco de Registros' }
    ],
    instructions: ['R', 'lw'],
    verilogFileName: 'mux1.v',
    verilogCode: `// Mux1: Selector de dato a escribir en registro (MemToReg)
module mux1 (
    input wire [31:0] alu_result,
    input wire [31:0] mem_data,
    input wire mem_to_reg,
    output wire [31:0] dw
);
    assign dw = mem_to_reg ? mem_data : alu_result;
endmodule`,
    hint: 'Ubicado al extremo derecho del datapath. Su salida viaja en el bus largo de retorno hacia DW del Banco de Registros.',
    slotCoordinates: { x: 960, y: 360, width: 45, height: 95 }
  },
  {
    id: 'shift_branch',
    name: 'Shift Left (branch)',
    shortLabel: 'Shift L (Branch)',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Desplazador lógico a la izquierda de 2 posiciones para la dirección de branch. Multiplica el offset inmediato extendido por 4 (convierte número de instrucciones a número de bytes).',
    purpose: 'En MIPS las instrucciones miden 4 bytes; desplazar 2 bits a la izquierda equivale a multiplicar por 4 para alinear la dirección destino de salto relativo.',
    inputs: [
      { name: 'SignExt [31:0]', bits: '32 bits', description: 'Inmediato extendido con signo' }
    ],
    outputs: [
      { name: 'Shifted [31:0]', bits: '32 bits', description: 'Offset desplazado 2 bits a la izquierda (in << 2)' }
    ],
    instructions: ['beq'],
    verilogFileName: 'shift_branch.v',
    verilogCode: `// Shift Left 2 para Branch (32 bits a 32 bits)
module shift_branch (
    input wire [31:0] in,
    output wire [31:0] out
);
    assign out = {in[29:0], 2'b00};
endmodule`,
    hint: 'Se ubica en la parte superior derecha media, entre Sign Ext y el Sumador de Branch.',
    slotCoordinates: { x: 550, y: 190, width: 80, height: 65 }
  },
  {
    id: 'adder_branch',
    name: 'Sumador de Branch',
    shortLabel: 'Sum. Branch',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Sumador de 32 bits que calcula la dirección destino de la bifurcación condicional sumando (PC+4) con el offset inmediato desplazado.',
    purpose: 'Calcular el objetivo de salto relativo al PC (Branch Target Address = PC+4 + (offset << 2)).',
    inputs: [
      { name: 'PC+4', bits: '32 bits [31:0]', description: 'Dirección secuencial calculada por el Sumador PC+4' },
      { name: 'Offset << 2', bits: '32 bits [31:0]', description: 'Inmediato desplazado desde Shift Left (branch)' }
    ],
    outputs: [
      { name: 'Branch Target', bits: '32 bits [31:0]', description: 'Dirección de salto de la bifurcación condicional' }
    ],
    instructions: ['beq'],
    verilogFileName: 'adder_branch.v',
    verilogCode: `// Sumador de dirección de bifurcación
module adder_branch (
    input wire [31:0] pc_plus_4,
    input wire [31:0] branch_offset,
    output wire [31:0] branch_target
);
    assign branch_target = pc_plus_4 + branch_offset;
endmodule`,
    hint: 'Se ubica en la zona superior derecha. Suma PC+4 con el offset desplazado.',
    slotCoordinates: { x: 670, y: 150, width: 85, height: 95 }
  },
  {
    id: 'and_gate',
    name: 'Compuerta AND',
    shortLabel: 'AND Branch',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Compuerta lógica AND que decide si se toma la bifurcación condicional beq. Realiza la operación lógica (Branch AND zf).',
    purpose: 'Si la instrucción es beq (Branch=1) y los registros comparados son iguales (zf=1), activa PCSrc=1 para tomar el salto.',
    inputs: [
      { name: 'Branch', bits: '1 bit', description: 'Señal emitida por la Unidad de Control indicando instrucción beq', isControl: true },
      { name: 'zf', bits: '1 bit', description: 'Bandera Zero Flag emitida por la ALU indicando igualdad (resta dio 0)', isControl: true }
    ],
    outputs: [
      { name: 'PCSrc', bits: '1 bit', description: 'Selector para Mux4: 1 toma el branch, 0 continúa secuencial (PC+4)', isControl: true }
    ],
    instructions: ['beq'],
    verilogFileName: 'and_gate.v',
    verilogCode: `// Compuerta AND para decisión de bifurcación (Branch AND zf)
module and_gate (
    input wire branch,
    input wire zf,
    output wire pc_src
);
    assign pc_src = branch & zf;
endmodule`,
    hint: 'Compuerta lógica pequeña en la parte superior. Recibe la señal Branch de la Unidad de Control y zf de la ALU.',
    slotCoordinates: { x: 780, y: 110, width: 65, height: 60 }
  },
  {
    id: 'mux4',
    name: 'Mux4',
    shortLabel: 'Mux4 Branch',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Multiplexor 2 a 1 de 32 bits controlado por la salida de la Compuerta AND (PCSrc). Elige entre la dirección secuencial (PC+4) y la dirección destino del branch.',
    purpose: 'Decidir si el procesador continúa secuencialmente o salta a la dirección de branch.',
    inputs: [
      { name: 'PC+4', bits: '32 bits [31:0]', description: 'Entrada 0: Dirección secuencial siguiente' },
      { name: 'Branch Target', bits: '32 bits [31:0]', description: 'Entrada 1: Dirección destino calculada por Sumador de Branch' },
      { name: 'PCSrc', bits: '1 bit', description: 'Señal de control emitida por la Compuerta AND', isControl: true }
    ],
    outputs: [
      { name: 'Mux4_Out', bits: '32 bits [31:0]', description: 'Dirección seleccionada (PC+4 o Branch Target)' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'mux4.v',
    verilogCode: `// Mux4: Selector entre PC+4 y dirección de Branch
module mux4 (
    input wire [31:0] pc_plus_4,
    input wire [31:0] branch_target,
    input wire pc_src,
    output wire [31:0] out
);
    assign out = pc_src ? branch_target : pc_plus_4;
endmodule`,
    hint: 'Se ubica en la parte superior derecha. Conmuta entre PC+4 y Branch Target según la compuerta AND.',
    slotCoordinates: { x: 880, y: 120, width: 45, height: 85 }
  },
  {
    id: 'shift_jump',
    name: 'Shift Left (jump)',
    shortLabel: 'Shift L (Jump)',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Desplazador lógico de 26 a 28 bits para el salto incondicional j. Toma el campo target [25:0] y lo desplaza 2 bits a la izquierda ({target, 2\'b00}).',
    purpose: 'Alinear la dirección de 26 bits a múltiplos de 4 (28 bits) para formar la dirección pseudo-directa de salto incondicional.',
    inputs: [
      { name: 'Target [25:0]', bits: '26 bits', description: 'Campo de dirección de salto incondicional de la instrucción' }
    ],
    outputs: [
      { name: 'JumpAddr [27:0]', bits: '28 bits', description: 'Dirección de salto desplazada 2 bits a la izquierda' }
    ],
    instructions: ['j'],
    verilogFileName: 'shift_jump.v',
    verilogCode: `// Shift Left 2 para Jump (26 bits a 28 bits)
module shift_jump (
    input wire [25:0] in,
    output wire [27:0] out
);
    assign out = {in, 2'b00};
endmodule`,
    hint: 'Se ubica en la parte superior izquierda/media. Convierte los 26 bits de salto en 28 bits multiplicando por 4.',
    slotCoordinates: { x: 330, y: 20, width: 85, height: 50 }
  },
  {
    id: 'mux5',
    name: 'Mux5',
    shortLabel: 'Mux5 Jump',
    category: 'branch_jump',
    categoryName: 'Saltos y Bifurcaciones',
    description: 'Multiplexor 2 a 1 de 32 bits final controlado por la señal Jump. Elige entre el resultado de Mux4 (PC+4 o Branch) y la dirección final de salto incondicional formada por {PC+4[31:28], JumpAddr[27:0]}.',
    purpose: 'Determinar el valor definitivo de next_pc que será cargado en el PC en el siguiente flanco de reloj.',
    inputs: [
      { name: 'Mux4_Out', bits: '32 bits [31:0]', description: 'Entrada 0: Dirección proveniente de Mux4 (PC+4 o Branch)' },
      { name: '{PC+4[31:28], JumpAddr}', bits: '32 bits [31:0]', description: 'Entrada 1: Dirección completa de salto incondicional' },
      { name: 'Jump', bits: '1 bit', description: 'Señal de control emitida por la Unidad de Control', isControl: true }
    ],
    outputs: [
      { name: 'Next PC', bits: '32 bits [31:0]', description: 'Dirección definitiva que entra al PC' }
    ],
    instructions: ['R', 'lw', 'sw', 'beq', 'j'],
    verilogFileName: 'mux5.v',
    verilogCode: `// Mux5: Selector final entre flujo normal/branch y Jump
module mux5 (
    input wire [31:0] branch_or_pc4,
    input wire [31:0] jump_target,
    input wire jump,
    output wire [31:0] next_pc
);
    assign next_pc = jump ? jump_target : branch_or_pc4;
endmodule`,
    hint: 'El multiplexor en la cima extrema derecha superior. Su salida alimenta el bucle de retroalimentación hacia el PC.',
    slotCoordinates: { x: 970, y: 70, width: 45, height: 85 }
  }
]
