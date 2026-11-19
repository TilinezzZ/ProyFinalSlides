`timescale 1ns / 1ps

module shift_left_2 #(
    parameter IN_WIDTH  = 32,
    parameter OUT_WIDTH = 32
)(
    input  wire [IN_WIDTH-1:0]  in,
    output wire [OUT_WIDTH-1:0] out
);

    assign out = {in[OUT_WIDTH-3:0], 2'b00};

endmodule
