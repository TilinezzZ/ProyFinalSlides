// ============================================================================
// Testbench: tb_shift_left_2
// ============================================================================
`timescale 1ns / 1ps

module tb_shift_left_2;
    reg  [31:0] branch_in;
    wire [31:0] branch_out;

    reg  [25:0] jump_in;
    wire [27:0] jump_out;

    // Instancia para Branch
    shift_left_2 #(.IN_WIDTH(32), .OUT_WIDTH(32)) uut_branch (
        .in(branch_in),
        .out(branch_out)
    );

    // Instancia para Jump
    shift_left_2 #(.IN_WIDTH(26), .OUT_WIDTH(28)) uut_jump (
        .in(jump_in),
        .out(jump_out)
    );

    initial begin
        branch_in = 32'd3;
        #10;
        if (branch_out !== 32'd12) $error("Fallo shift branch (3 << 2 != 12)");

        jump_in = 26'h0010008;
        #10;
        if (jump_out !== 28'h0040020) $error("Fallo shift jump");

        $display("[TB_SHIFT_LEFT_2] Test finalizado exitosamente.");
        $finish;
    end
endmodule
