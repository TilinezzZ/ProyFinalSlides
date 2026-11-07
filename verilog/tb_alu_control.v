// ============================================================================
// Testbench: tb_alu_control
// ============================================================================
`timescale 1ns / 1ps

module tb_alu_control;
    reg  [1:0] alu_op;
    reg  [5:0] funct;
    wire [2:0] alu_ctrl;

    alu_control uut (
        .alu_op(alu_op),
        .funct(funct),
        .alu_ctrl(alu_ctrl)
    );

    initial begin
        // lw / sw
        alu_op = 2'b00; funct = 6'b000000;
        #10;
        if (alu_ctrl !== 3'b010) $error("Fallo lw/sw -> ADD");

        // beq
        alu_op = 2'b01; funct = 6'b000000;
        #10;
        if (alu_ctrl !== 3'b110) $error("Fallo beq -> SUB");

        // R-type add
        alu_op = 2'b10; funct = 6'b100000;
        #10;
        if (alu_ctrl !== 3'b010) $error("Fallo R-type add");

        // R-type sub
        alu_op = 2'b10; funct = 6'b100010;
        #10;
        if (alu_ctrl !== 3'b110) $error("Fallo R-type sub");

        $display("[TB_ALU_CONTROL] Test finalizado exitosamente.");
        $finish;
    end
endmodule
