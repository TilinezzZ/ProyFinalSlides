// ============================================================================
// Testbench: tb_sign_ext
// ============================================================================
`timescale 1ns / 1ps

module tb_sign_ext;
    reg  [15:0] in;
    wire [31:0] out;

    sign_ext uut (
        .in(in),
        .out(out)
    );

    initial begin
        // Caso positivo (+4)
        in = 16'h0004;
        #10;
        if (out !== 32'h00000004) $error("Error en extensión de número positivo");

        // Caso negativo (-4 = 0xFFFC)
        in = 16'hFFFC;
        #10;
        if (out !== 32'hFFFFFFFC) $error("Error en extensión de número negativo");

        $display("[TB_SIGN_EXT] Test finalizado exitosamente.");
        $finish;
    end
endmodule
