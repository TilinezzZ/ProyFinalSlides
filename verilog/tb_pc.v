// ============================================================================
// Testbench: tb_pc
// ============================================================================
`timescale 1ns / 1ps

module tb_pc;
    reg         clk;
    reg         rst;
    reg  [31:0] next_pc;
    wire [31:0] pc;

    pc uut (
        .clk(clk),
        .rst(rst),
        .next_pc(next_pc),
        .pc(pc)
    );

    // Generador de reloj (periodo = 10ns -> 100MHz)
    always #5 clk = ~clk;

    initial begin
        clk = 0;
        rst = 1;
        next_pc = 32'h00400004;
        #15;
        rst = 0;
        #10;
        next_pc = 32'h00400008;
        #10;
        next_pc = 32'h0040000C;
        #10;
        $display("[TB_PC] Test finalizado exitosamente.");
        $finish;
    end
endmodule
