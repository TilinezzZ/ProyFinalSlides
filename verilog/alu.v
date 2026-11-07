// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: ALU (Unidad Aritmético-Lógica de 32 bits)
// ============================================================================
`timescale 1ns / 1ps

module alu (
    input  wire [31:0] a,          // Operando A
    input  wire [31:0] b,          // Operando B
    input  wire [2:0]  alu_ctrl,   // Código de control de la ALU
    output reg  [31:0] result,     // Resultado de 32 bits
    output wire        zf          // Zero Flag: 1 si result == 0
);

    always @(*) begin
        case (alu_ctrl)
            3'b000: result = a & b;                                      // AND
            3'b001: result = a | b;                                      // OR
            3'b010: result = a + b;                                      // ADD
            3'b110: result = a - b;                                      // SUB
            3'b111: result = ($signed(a) < $signed(b)) ? 32'd1 : 32'd0;  // SLT
            3'b100: result = ~(a | b);                                   // NOR
            default: result = 32'd0;
        endcase
    end

    // Bandera Zero Flag
    assign zf = (result == 32'd0);

endmodule
