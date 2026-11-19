`timescale 1ns / 1ps

module register_file (
    input  wire        clk,
    input  wire        rst,
    input  wire        en_BR,
    input  wire [4:0]  AR1,
    input  wire [4:0]  AR2,
    input  wire [4:0]  AW,
    input  wire [31:0] DW,
    output wire [31:0] DR1,
    output wire [31:0] DR2
);

    reg [31:0] regs [0:31];
    integer i;

    always @(posedge clk or posedge rst) begin
        if (rst) begin
            for (i = 0; i < 32; i = i + 1) begin
                regs[i] <= 32'd0;
            end

            regs[17] <= 32'd25;

            regs[18] <= 32'd15;
        end else if (en_BR && (AW != 5'd0)) begin

            regs[AW] <= DW;
        end
    end

    assign DR1 = (AR1 == 5'd0) ? 32'd0 : regs[AR1];
    assign DR2 = (AR2 == 5'd0) ? 32'd0 : regs[AR2];

endmodule
