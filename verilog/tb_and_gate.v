// ============================================================================
// Testbench: tb_and_gate
// ============================================================================
`timescale 1ns / 1ps

module tb_and_gate;
    reg  a;
    reg  b;
    wire out;

    and_gate uut (
        .a(a),
        .b(b),
        .out(out)
    );

    initial begin
        a = 0; b = 0; #10; if (out !== 0) $error("Fallo AND 0 0");
        a = 0; b = 1; #10; if (out !== 0) $error("Fallo AND 0 1");
        a = 1; b = 0; #10; if (out !== 0) $error("Fallo AND 1 0");
        a = 1; b = 1; #10; if (out !== 1) $error("Fallo AND 1 1");
        $display("[TB_AND_GATE] Test finalizado exitosamente.");
        $finish;
    end
endmodule
