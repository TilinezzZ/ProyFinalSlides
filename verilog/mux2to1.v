// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: mux2to1 (Multiplexor 2 a 1 parametrizado)
// Utilizado para: Mux1, Mux2, Mux3, Mux4, Mux5
// ============================================================================
`timescale 1ns / 1ps

module mux2to1 #(
    parameter WIDTH = 32
)(
    input  wire [WIDTH-1:0] in0,   // Entrada 0 (sel = 0)
    input  wire [WIDTH-1:0] in1,   // Entrada 1 (sel = 1)
    input  wire             sel,   // Línea de selección
    output wire [WIDTH-1:0] out    // Salida seleccionada
);

    assign out = sel ? in1 : in0;

endmodule
