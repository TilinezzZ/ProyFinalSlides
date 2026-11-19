`timescale 1ns / 1ps

module control_unit (
    input  wire [5:0] op,
    output reg        en_BR,
    output reg        RegDst,
    output reg        ALU_Src,
    output reg  [1:0] ALU_Op,
    output reg        MemToReg,
    output reg        MemRead,
    output reg        MemWrite,
    output reg        Branch,
    output reg        Jump
);

    always @(*) begin

        en_BR    = 1'b0;
        RegDst   = 1'b0;
        ALU_Src  = 1'b0;
        ALU_Op   = 2'b00;
        MemToReg = 1'b0;
        MemRead  = 1'b0;
        MemWrite = 1'b0;
        Branch   = 1'b0;
        Jump     = 1'b0;

        case (op)

            6'b000000: begin
                en_BR    = 1'b1;
                RegDst   = 1'b1;
                ALU_Src  = 1'b0;
                ALU_Op   = 2'b10;
                MemToReg = 1'b0;
            end

            6'b100011: begin
                en_BR    = 1'b1;
                RegDst   = 1'b0;
                ALU_Src  = 1'b1;
                ALU_Op   = 2'b00;
                MemToReg = 1'b1;
                MemRead  = 1'b1;
            end

            6'b101011: begin
                ALU_Src  = 1'b1;
                ALU_Op   = 2'b00;
                MemWrite = 1'b1;
            end

            6'b000100: begin
                ALU_Src  = 1'b0;
                ALU_Op   = 2'b01;
                Branch   = 1'b1;
            end

            6'b000010: begin
                Jump     = 1'b1;
            end

            default: ;
        endcase
    end

endmodule
