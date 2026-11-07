// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Unidad de Control
// ============================================================================
`timescale 1ns / 1ps

module control_unit (
    input  wire [5:0] op,         // Bits [31:26] de la instrucción
    output reg        en_BR,      // Habilita escritura en Banco de Registros
    output reg        RegDst,     // Selecciona AW: 0=rt, 1=rd
    output reg        ALU_Src,    // Selecciona entrada B de ALU: 0=DR2, 1=SignExt
    output reg  [1:0] ALU_Op,     // Tipo de operación para ALU Control
    output reg        MemToReg,   // Selecciona DW: 0=ALU, 1=Memoria
    output reg        MemRead,    // Habilita lectura en Memoria de Datos
    output reg        MemWrite,   // Habilita escritura en Memoria de Datos
    output reg        Branch,     // Indica instrucción de salto condicional beq
    output reg        Jump        // Indica salto incondicional j
);

    always @(*) begin
        // Valores por defecto
        en_BR    = 1'b0;
        RegDst   = 1'b0;
        ALU_Src  = 1'b0;
        ALU_Op   = 2'b00;
        MemToReg = 1'b0;
        MemRead  = 1'b0;
        MemWrite = 1'b0;
        Branch   = 1'b0;
        Jump     = 1'b0;

        case (op)
            // Tipo R (add, sub, and, or, slt)
            6'b000000: begin
                en_BR    = 1'b1;
                RegDst   = 1'b1;
                ALU_Src  = 1'b0;
                ALU_Op   = 2'b10;
                MemToReg = 1'b0;
            end

            // lw (Load Word)
            6'b100011: begin
                en_BR    = 1'b1;
                RegDst   = 1'b0;
                ALU_Src  = 1'b1;
                ALU_Op   = 2'b00; // Suma base + offset
                MemToReg = 1'b1;
                MemRead  = 1'b1;
            end

            // sw (Store Word)
            6'b101011: begin
                ALU_Src  = 1'b1;
                ALU_Op   = 2'b00; // Suma base + offset
                MemWrite = 1'b1;
            end

            // beq (Branch on Equal)
            6'b000100: begin
                ALU_Src  = 1'b0;
                ALU_Op   = 2'b01; // Resta para comparación
                Branch   = 1'b1;
            end

            // j (Jump incondicional)
            6'b000010: begin
                Jump     = 1'b1;
            end

            default: ;
        endcase
    end

endmodule
