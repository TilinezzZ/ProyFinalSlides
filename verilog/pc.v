// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: PC (Program Counter)
// Seminario de Solución de Problemas de Arquitectura de Computadoras - CUCEI
// ============================================================================
`timescale 1ns / 1ps

module pc (
    input  wire        clk,        // Reloj del sistema
    input  wire        rst,        // Reset asincrónico activo en alto
    input  wire [31:0] next_pc,    // Siguiente dirección de instrucción
    output reg  [31:0] pc          // Dirección actual de instrucción
);

    always @(posedge clk or posedge rst) begin
        if (rst) begin
            // Dirección inicial estándar del segmento de texto
            pc <= 32'h00400000;
        end else begin
            pc <= next_pc;
        end
    end

endmodule
