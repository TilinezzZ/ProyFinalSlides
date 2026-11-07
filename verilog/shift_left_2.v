// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: shift_left_2 (Desplazador lógico a la izquierda de 2 bits parametrizado)
// Utilizado para:
//   - Shift Left (branch): IN_WIDTH=32, OUT_WIDTH=32
//   - Shift Left (jump):   IN_WIDTH=26, OUT_WIDTH=28
// ============================================================================
`timescale 1ns / 1ps

module shift_left_2 #(
    parameter IN_WIDTH  = 32,
    parameter OUT_WIDTH = 32
)(
    input  wire [IN_WIDTH-1:0]  in,
    output wire [OUT_WIDTH-1:0] out
);

    assign out = {in[OUT_WIDTH-3:0], 2'b00};

endmodule
