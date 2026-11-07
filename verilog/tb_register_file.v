// ============================================================================
// Testbench: tb_register_file
// ============================================================================
`timescale 1ns / 1ps

module tb_register_file;
    reg         clk;
    reg         rst;
    reg         en_BR;
    reg  [4:0]  AR1;
    reg  [4:0]  AR2;
    reg  [4:0]  AW;
    reg  [31:0] DW;
    wire [31:0] DR1;
    wire [31:0] DR2;

    register_file uut (
        .clk(clk),
        .rst(rst),
        .en_BR(en_BR),
        .AR1(AR1),
        .AR2(AR2),
        .AW(AW),
        .DW(DW),
        .DR1(DR1),
        .DR2(DR2)
    );

    always #5 clk = ~clk;

    initial begin
        clk = 0;
        rst = 1;
        en_BR = 0;
        AR1 = 0;
        AR2 = 0;
        AW = 0;
        DW = 0;
        #15;
        rst = 0;

        // Leer registros iniciales $17 y $18
        AR1 = 5'd17;
        AR2 = 5'd18;
        #10;
        if (DR1 !== 32'd25 || DR2 !== 32'd15) $error("Error en valores iniciales");

        // Escribir en $8 ($t0)
        AW = 5'd8;
        DW = 32'd40;
        en_BR = 1;
        #10;
        en_BR = 0;

        // Verificar lectura de $8
        AR1 = 5'd8;
        #10;
        if (DR1 !== 32'd40) $error("Error escribiendo en registro $8");

        $display("[TB_REGISTER_FILE] Test finalizado exitosamente.");
        $finish;
    end
endmodule
