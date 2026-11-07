// ============================================================================
// Testbench: tb_adder
// ============================================================================
`timescale 1ns / 1ps

module tb_adder;
    reg  [31:0] a;
    reg  [31:0] b;
    wire [31:0] sum;

    adder #(.WIDTH(32)) uut (
        .a(a),
        .b(b),
        .sum(sum)
    );

    initial begin
        a = 32'h00400000;
        b = 32'd4;
        #10;
        if (sum !== 32'h00400004) $error("Error en suma PC+4");

        a = 32'h00400004;
        b = 32'd12;
        #10;
        if (sum !== 32'h00400010) $error("Error en suma Branch Target");

        $display("[TB_ADDER] Test finalizado exitosamente.");
        $finish;
    end
endmodule
