// ============================================================================
// Testbench: tb_mux2to1
// ============================================================================
`timescale 1ns / 1ps

module tb_mux2to1;
    reg  [31:0] in0;
    reg  [31:0] in1;
    reg         sel;
    wire [31:0] out;

    mux2to1 #(.WIDTH(32)) uut (
        .in0(in0),
        .in1(in1),
        .sel(sel),
        .out(out)
    );

    initial begin
        in0 = 32'hAAAAAAAA;
        in1 = 32'h55555555;
        sel = 0;
        #10;
        if (out !== in0) $error("Fallo con sel=0");

        sel = 1;
        #10;
        if (out !== in1) $error("Fallo con sel=1");

        $display("[TB_MUX2TO1] Test finalizado exitosamente.");
        $finish;
    end
endmodule
