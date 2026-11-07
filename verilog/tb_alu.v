// ============================================================================
// Testbench: tb_alu
// ============================================================================
`timescale 1ns / 1ps

module tb_alu;
    reg  [31:0] a;
    reg  [31:0] b;
    reg  [2:0]  alu_ctrl;
    wire [31:0] result;
    wire        zf;

    alu uut (
        .a(a),
        .b(b),
        .alu_ctrl(alu_ctrl),
        .result(result),
        .zf(zf)
    );

    initial begin
        // 1. ADD
        a = 32'd25;
        b = 32'd15;
        alu_ctrl = 3'b010;
        #10;
        if (result !== 32'd40 || zf !== 0) $error("Fallo en ADD");

        // 2. SUB (Resta con resultado 0 para probar zf)
        a = 32'd25;
        b = 32'd25;
        alu_ctrl = 3'b110;
        #10;
        if (result !== 32'd0 || zf !== 1) $error("Fallo en SUB con zf=1");

        // 3. AND
        a = 32'h0000FFFF;
        b = 32'h00FF00FF;
        alu_ctrl = 3'b000;
        #10;
        if (result !== 32'h000000FF) $error("Fallo en AND");

        // 4. SLT
        a = 32'd10;
        b = 32'd20;
        alu_ctrl = 3'b111;
        #10;
        if (result !== 32'd1) $error("Fallo en SLT");

        $display("[TB_ALU] Test finalizado exitosamente.");
        $finish;
    end
endmodule
