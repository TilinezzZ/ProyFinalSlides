// ============================================================================
// Testbench: tb_instruction_mem
// ============================================================================
`timescale 1ns / 1ps

module tb_instruction_mem;
    reg  [31:0] addr;
    wire [31:0] instruction;

    instruction_mem uut (
        .addr(addr),
        .instruction(instruction)
    );

    initial begin
        addr = 32'h00400000;
        #10;
        if (instruction !== 32'h02324020) $error("Error leyendo instrucción add");

        addr = 32'h00400004;
        #10;
        if (instruction !== 32'hAE280008) $error("Error leyendo instrucción sw");

        addr = 32'h00400008;
        #10;
        if (instruction !== 32'h8E290008) $error("Error leyendo instrucción lw");

        $display("[TB_INSTRUCTION_MEM] Test finalizado exitosamente.");
        $finish;
    end
endmodule
