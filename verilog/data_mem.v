`timescale 1ns / 1ps

module data_mem (
    input  wire        clk,
    input  wire        rst,
    input  wire        MemRead,
    input  wire        MemWrite,
    input  wire [31:0] Address_In,
    input  wire [31:0] Data_In,
    output wire [31:0] Lectura
);

    reg [31:0] ram [0:255];
    integer i;

    always @(posedge clk or posedge rst) begin
        if (rst) begin
            for (i = 0; i < 256; i = i + 1) begin
                ram[i] <= 32'd0;
            end
        end else if (MemWrite) begin
            ram[Address_In[9:2]] <= Data_In;
        end
    end

    assign Lectura = (MemRead) ? ram[Address_In[9:2]] : 32'd0;

endmodule
