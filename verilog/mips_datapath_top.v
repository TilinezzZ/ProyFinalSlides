// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: mips_datapath_top (Datapath Completo Integrado)
// Seminario de Solución de Problemas de Arquitectura de Computadoras - CUCEI
// ============================================================================
`timescale 1ns / 1ps

module mips_datapath_top (
    input  wire        clk,            // Reloj principal
    input  wire        rst,            // Reset asincrónico

    // Puertos de monitoreo y verificación de señales principales
    output wire [31:0] pc_out,         // Valor actual del PC
    output wire [31:0] instruction,    // Instrucción leída de 32 bits
    output wire [4:0]  AR1,            // rs [25:21]
    output wire [4:0]  AR2,            // rt [20:16]
    output wire [4:0]  AW,             // Dirección destino en Banco de Registros
    output wire [31:0] DR1,            // Dato leído 1 (rs)
    output wire [31:0] DR2,            // Dato leído 2 (rt)
    output wire [31:0] DW,             // Dato a escribir en registros
    output wire        en_BR,          // Señal de escritura en registros
    output wire [31:0] alu_result,     // Resultado de la ALU
    output wire        zf,             // Zero Flag de la ALU
    output wire [31:0] mem_read_data,  // Dato leído de la Memoria de Datos
    output wire [31:0] next_pc         // Siguiente dirección a cargar en el PC
);

    // ========================================================================
    // SEÑALES INTERNAS DEL DATAPATH
    // ========================================================================

    // 1. Cables de Fetch
    wire [31:0] pc_current;
    wire [31:0] pc_plus_4;

    // 2. Señales de la Unidad de Control
    wire        RegDst;
    wire        ALU_Src;
    wire [1:0]  ALU_Op;
    wire        MemToReg;
    wire        MemRead;
    wire        MemWrite;
    wire        Branch;
    wire        Jump;

    // 3. Extensión de Signo
    wire [31:0] sign_ext_out;

    // 4. Cables de Ejecución y ALU
    wire [31:0] alu_b;
    wire [2:0]  alu_ctrl;

    // 5. Cables de Saltos (Branch y Jump)
    wire [31:0] branch_offset_shifted;
    wire [31:0] branch_target;
    wire        pc_src;
    wire [31:0] mux4_out;
    wire [27:0] jump_addr_28;
    wire [31:0] jump_target_32;

    // Asignaciones de puertos de monitoreo
    assign pc_out        = pc_current;
    assign AR1           = instruction[25:21];
    assign AR2           = instruction[20:16];
    assign jump_target_32 = {pc_plus_4[31:28], jump_addr_28};

    // ========================================================================
    // INSTANCIACIÓN DE LOS 18 COMPONENTES (DIAPOSITIVA 17)
    // ========================================================================

    // Componente 1: PC (Contador de Programa)
    pc pc_inst (
        .clk(clk),
        .rst(rst),
        .next_pc(next_pc),
        .pc(pc_current)
    );

    // Componente 2: Sumador PC+4
    adder #(.WIDTH(32)) adder_pc4_inst (
        .a(pc_current),
        .b(32'd4),
        .sum(pc_plus_4)
    );

    // Componente 3: Memoria de Instrucciones
    instruction_mem imem_inst (
        .addr(pc_current),
        .instruction(instruction)
    );

    // Componente 4: Unidad de Control
    control_unit control_unit_inst (
        .op(instruction[31:26]),
        .en_BR(en_BR),
        .RegDst(RegDst),
        .ALU_Src(ALU_Src),
        .ALU_Op(ALU_Op),
        .MemToReg(MemToReg),
        .MemRead(MemRead),
        .MemWrite(MemWrite),
        .Branch(Branch),
        .Jump(Jump)
    );

    // Componente 5: Mux2 (RegDst) - Elige entre rt [20:16] y rd [15:11] para AW
    mux2to1 #(.WIDTH(5)) mux2_inst (
        .in0(instruction[20:16]),
        .in1(instruction[15:11]),
        .sel(RegDst),
        .out(AW)
    );

    // Componente 6: Banco de Registros
    register_file reg_file_inst (
        .clk(clk),
        .rst(rst),
        .en_BR(en_BR),
        .AR1(instruction[25:21]),
        .AR2(instruction[20:16]),
        .AW(AW),
        .DW(DW),
        .DR1(DR1),
        .DR2(DR2)
    );

    // Componente 7: Sign Ext (16 -> 32 bits con signo)
    sign_ext sign_ext_inst (
        .in(instruction[15:0]),
        .out(sign_ext_out)
    );

    // Componente 8: Mux3 (ALU_Src) - Elige entre DR2 e Inmediato Extendido para ALU Entrada B
    mux2to1 #(.WIDTH(32)) mux3_inst (
        .in0(DR2),
        .in1(sign_ext_out),
        .sel(ALU_Src),
        .out(alu_b)
    );

    // Componente 9: ALU Control
    alu_control alu_ctrl_inst (
        .alu_op(ALU_Op),
        .funct(instruction[5:0]),
        .alu_ctrl(alu_ctrl)
    );

    // Componente 10: ALU (Unidad Aritmético Lógica de 32 bits)
    alu alu_inst (
        .a(DR1),
        .b(alu_b),
        .alu_ctrl(alu_ctrl),
        .result(alu_result),
        .zf(zf)
    );

    // Componente 11: Memoria de Datos (RAM)
    data_mem data_mem_inst (
        .clk(clk),
        .rst(rst),
        .MemRead(MemRead),
        .MemWrite(MemWrite),
        .Address_In(alu_result),
        .Data_In(DR2),
        .Lectura(mem_read_data)
    );

    // Componente 12: Mux1 (MemToReg) - Elige entre ALU Result y Memoria para DW
    mux2to1 #(.WIDTH(32)) mux1_inst (
        .in0(alu_result),
        .in1(mem_read_data),
        .sel(MemToReg),
        .out(DW)
    );

    // Componente 13: Shift Left (branch) - Desplaza 2 bits el inmediato extendido
    shift_left_2 #(.IN_WIDTH(32), .OUT_WIDTH(32)) shift_branch_inst (
        .in(sign_ext_out),
        .out(branch_offset_shifted)
    );

    // Componente 14: Sumador de Branch - (PC+4 + branch_offset_shifted)
    adder #(.WIDTH(32)) adder_branch_inst (
        .a(pc_plus_4),
        .b(branch_offset_shifted),
        .sum(branch_target)
    );

    // Componente 15: Compuerta AND - (Branch AND zf)
    and_gate and_gate_inst (
        .a(Branch),
        .b(zf),
        .out(pc_src)
    );

    // Componente 16: Mux4 - Elige entre PC+4 y la dirección de Branch según pc_src
    mux2to1 #(.WIDTH(32)) mux4_inst (
        .in0(pc_plus_4),
        .in1(branch_target),
        .sel(pc_src),
        .out(mux4_out)
    );

    // Componente 17: Shift Left (jump) - Desplaza 2 bits el target de 26 a 28 bits
    shift_left_2 #(.IN_WIDTH(26), .OUT_WIDTH(28)) shift_jump_inst (
        .in(instruction[25:0]),
        .out(jump_addr_28)
    );

    // Componente 18: Mux5 - Elige entre Mux4 y Jump Target {PC+4[31:28], target<<2}
    mux2to1 #(.WIDTH(32)) mux5_inst (
        .in0(mux4_out),
        .in1(jump_target_32),
        .sel(Jump),
        .out(next_pc)
    );

endmodule
