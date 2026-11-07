// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Sign Ext (Extensión de signo 16 a 32 bits)
// ============================================================================
`timescale 1ns / 1ps

module sign_ext (
    input  wire [15:0] in,     // Inmediato de 16 bits
    output wire [31:0] out     // Inmediato extendido con signo a 32 bits
);

    assign out = {{16{in[15]}}, in};

endmodule
