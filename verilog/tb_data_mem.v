// ============================================================================
// Testbench: tb_data_mem
// ============================================================================
`timescale 1ns / 1ps

module tb_data_mem;
    reg         clk;
    reg         rst;
    reg         MemRead;
    reg         MemWrite;
    reg  [31:0] Address_In;
    reg  [31:0] Data_In;
    wire [31:0] Lectura;

    data_mem uut (
        .clk(clk),
        .rst(rst),
        .MemRead(MemRead),
        .MemWrite(MemWrite),
        .Address_In(Address_In),
        .Data_In(Data_In),
        .Lectura(Lectura)
    );

    always #5 clk = ~clk;

    initial begin
        clk = 0;
        rst = 1;
        MemRead = 0;
        MemWrite = 0;
        Address_In = 0;
        Data_In = 0;
        #15;
        rst = 0;

        // Escribir valor 99 en dirección 32'h00000020
        Address_In = 32'h00000020;
        Data_In = 32'd99;
        MemWrite = 1;
        #10;
        MemWrite = 0;

        // Leer valor en dirección 32'h00000020
        MemRead = 1;
        #10;
        if (Lectura !== 32'd99) $error("Error leyendo dato escrito en RAM");

        $display("[TB_DATA_MEM] Test finalizado exitosamente.");
        $finish;
    end
endmodule
