// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Memoria de Datos (RAM síncrona en escritura, asíncrona en lectura)
// ============================================================================
`timescale 1ns / 1ps

module data_mem (
    input  wire        clk,            // Reloj del sistema
    input  wire        rst,            // Reset general
    input  wire        MemRead,        // Habilitador de lectura
    input  wire        MemWrite,       // Habilitador de escritura
    input  wire [31:0] Address_In,     // Dirección calculada por la ALU
    input  wire [31:0] Data_In,        // Dato a escribir proveniente de DR2
    output wire [31:0] Lectura         // Dato leído hacia Mux1
);

    reg [31:0] ram [0:255];
    integer i;

    // Inicialización y reset
    always @(posedge clk or posedge rst) begin
        if (rst) begin
            for (i = 0; i < 256; i = i + 1) begin
                ram[i] <= 32'd0;
            end
        end else if (MemWrite) begin
            ram[Address_In[9:2]] <= Data_In;
        end
    end

    // Lectura combinacional
    assign Lectura = (MemRead) ? ram[Address_In[9:2]] : 32'd0;

endmodule
