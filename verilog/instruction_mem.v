`timescale 1ns / 1ps

module instruction_mem (
    input  wire [31:0] addr,
    output wire [31:0] instruction
);

    reg [31:0] rom [0:255];

    initial begin

        rom[0] = 32'h02324020;

        rom[1] = 32'hAE280008;

        rom[2] = 32'h8E290008;

        rom[3] = 32'h11090001;

        rom[4] = 32'h00005020;

        rom[5] = 32'h08100008;
    end

    wire [7:0] word_idx = addr[9:2];

    assign instruction = rom[word_idx];

endmodule
