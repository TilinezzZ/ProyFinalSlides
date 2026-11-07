// ============================================================================
// Testbench: tb_control_unit
// ============================================================================
`timescale 1ns / 1ps

module tb_control_unit;
    reg  [5:0] op;
    wire       en_BR;
    wire       RegDst;
    wire       ALU_Src;
    wire [1:0] ALU_Op;
    wire       MemToReg;
    wire       MemRead;
    wire       MemWrite;
    wire       Branch;
    wire       Jump;

    control_unit uut (
        .op(op),
        .en_BR(en_BR),
        .RegDst(RegDst),
        .ALU_Src(ALU_Src),
        .ALU_Op(ALU_Op),
        .MemToReg(MemToReg),
        .MemRead(MemRead),
        .MemWrite(MemWrite),
        .Branch(Branch),
        .Jump(Jump)
    );

    initial begin
        // 1. Tipo R
        op = 6'b000000;
        #10;
        if (!(en_BR && RegDst && ALU_Op == 2'b10)) $error("Fallo decodificación Tipo R");

        // 2. lw
        op = 6'b100011;
        #10;
        if (!(en_BR && !RegDst && ALU_Src && MemRead && MemToReg)) $error("Fallo decodificación lw");

        // 3. sw
        op = 6'b101011;
        #10;
        if (!(MemWrite && ALU_Src && !en_BR)) $error("Fallo decodificación sw");

        // 4. beq
        op = 6'b000100;
        #10;
        if (!(Branch && ALU_Op == 2'b01)) $error("Fallo decodificación beq");

        // 5. j
        op = 6'b000010;
        #10;
        if (!Jump) $error("Fallo decodificación j");

        $display("[TB_CONTROL_UNIT] Test finalizado exitosamente.");
        $finish;
    end
endmodule
