// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Banco de Registros (32 registros de 32 bits)
// ============================================================================
`timescale 1ns / 1ps

module register_file (
    input  wire        clk,        // Reloj del sistema
    input  wire        rst,        // Reset general
    input  wire        en_BR,      // Habilita escritura en registros (RegWrite)
    input  wire [4:0]  AR1,        // Dirección de lectura 1 (rs)
    input  wire [4:0]  AR2,        // Dirección de lectura 2 (rt)
    input  wire [4:0]  AW,         // Dirección de escritura (rd o rt)
    input  wire [31:0] DW,         // Dato a escribir
    output wire [31:0] DR1,        // Dato leído 1
    output wire [31:0] DR2         // Dato leído 2
);

    reg [31:0] regs [0:31];
    integer i;

    // Inicialización y reset
    always @(posedge clk or posedge rst) begin
        if (rst) begin
            for (i = 0; i < 32; i = i + 1) begin
                regs[i] <= 32'd0;
            end
            // Valores iniciales precargados para test de simulación:
            // $s1 ($17) = 25
            regs[17] <= 32'd25;
            // $s2 ($18) = 15
            regs[18] <= 32'd15;
        end else if (en_BR && (AW != 5'd0)) begin
            // Escritura sincrónica (registro $0 es de solo lectura con valor 0)
            regs[AW] <= DW;
        end
    end

    // Lectura asíncrona combinacional
    assign DR1 = (AR1 == 5'd0) ? 32'd0 : regs[AR1];
    assign DR2 = (AR2 == 5'd0) ? 32'd0 : regs[AR2];

endmodule
