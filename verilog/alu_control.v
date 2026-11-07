// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: ALU Control
// ============================================================================
`timescale 1ns / 1ps

module alu_control (
    input  wire [1:0] alu_op,     // Líneas de operación preliminar de la Unidad de Control
    input  wire [5:0] funct,      // Campo funct [5:0] de la instrucción
    output reg  [2:0] alu_ctrl    // Código de operación específico de 3 bits para la ALU
);

    always @(*) begin
        case (alu_op)
            2'b00: alu_ctrl = 3'b010; // lw / sw -> Suma para cálculo de dirección
            2'b01: alu_ctrl = 3'b110; // beq     -> Resta para comparación
            2'b10: begin             // Tipo R según el campo funct
                case (funct)
                    6'b100000: alu_ctrl = 3'b010; // add
                    6'b100010: alu_ctrl = 3'b110; // sub
                    6'b100100: alu_ctrl = 3'b000; // and
                    6'b100101: alu_ctrl = 3'b001; // or
                    6'b101010: alu_ctrl = 3'b111; // slt
                    6'b100111: alu_ctrl = 3'b100; // nor
                    default:   alu_ctrl = 3'b010;
                endcase
            end
            default: alu_ctrl = 3'b010;
        endcase
    end

endmodule
