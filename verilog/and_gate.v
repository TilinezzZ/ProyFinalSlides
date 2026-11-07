// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Compuerta AND (Decisión de bifurcación: Branch AND zf)
// ============================================================================
`timescale 1ns / 1ps

module and_gate (
    input  wire a,      // Señal Branch proveniente de la Unidad de Control
    input  wire b,      // Bandera zf (Zero Flag) proveniente de la ALU
    output wire out     // Señal PCSrc hacia el selector de Mux4
);

    assign out = a & b;

endmodule
