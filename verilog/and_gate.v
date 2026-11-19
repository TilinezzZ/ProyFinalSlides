`timescale 1ns / 1ps

module and_gate (
    input  wire a,
    input  wire b,
    output wire out
);

    assign out = a & b;

endmodule
