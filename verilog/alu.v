`timescale 1ns / 1ps

module alu (
    input  wire [31:0] a,
    input  wire [31:0] b,
    input  wire [2:0]  alu_ctrl,
    output reg  [31:0] result,
    output wire        zf
);

    always @(*) begin
        case (alu_ctrl)
            3'b000: result = a & b;
            3'b001: result = a | b;
            3'b010: result = a + b;
            3'b110: result = a - b;
            3'b111: result = ($signed(a) < $signed(b)) ? 32'd1 : 32'd0;
            3'b100: result = ~(a | b);
            default: result = 32'd0;
        endcase
    end

    assign zf = (result == 32'd0);

endmodule
