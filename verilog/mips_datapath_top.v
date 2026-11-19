`timescale 1ns / 1ps

module mips_datapath_top (
    input  wire        clk,
    input  wire        rst,

    output wire [31:0] pc_out,
    output wire [31:0] instruction,
    output wire [4:0]  AR1,
    output wire [4:0]  AR2,
    output wire [4:0]  AW,
    output wire [31:0] DR1,
    output wire [31:0] DR2,
    output wire [31:0] DW,
    output wire        en_BR,
    output wire [31:0] alu_result,
    output wire        zf,
    output wire [31:0] mem_read_data,
    output wire [31:0] next_pc
);

    wire [31:0] pc_current;
    wire [31:0] pc_plus_4;

    wire        RegDst;
    wire        ALU_Src;
    wire [1:0]  ALU_Op;
    wire        MemToReg;
    wire        MemRead;
    wire        MemWrite;
    wire        Branch;
    wire        Jump;

    wire [31:0] sign_ext_out;

    wire [31:0] alu_b;
    wire [2:0]  alu_ctrl;

    wire [31:0] branch_offset_shifted;
    wire [31:0] branch_target;
    wire        pc_src;
    wire [31:0] mux4_out;
    wire [27:0] jump_addr_28;
    wire [31:0] jump_target_32;

    assign pc_out        = pc_current;
    assign AR1           = instruction[25:21];
    assign AR2           = instruction[20:16];
    assign jump_target_32 = {pc_plus_4[31:28], jump_addr_28};

    pc pc_inst (
        .clk(clk),
        .rst(rst),
        .next_pc(next_pc),
        .pc(pc_current)
    );

    adder #(.WIDTH(32)) adder_pc4_inst (
        .a(pc_current),
        .b(32'd4),
        .sum(pc_plus_4)
    );

    instruction_mem imem_inst (
        .addr(pc_current),
        .instruction(instruction)
    );

    control_unit control_unit_inst (
        .op(instruction[31:26]),
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

    mux2to1 #(.WIDTH(5)) mux2_inst (
        .in0(instruction[20:16]),
        .in1(instruction[15:11]),
        .sel(RegDst),
        .out(AW)
    );

    register_file reg_file_inst (
        .clk(clk),
        .rst(rst),
        .en_BR(en_BR),
        .AR1(instruction[25:21]),
        .AR2(instruction[20:16]),
        .AW(AW),
        .DW(DW),
        .DR1(DR1),
        .DR2(DR2)
    );

    sign_ext sign_ext_inst (
        .in(instruction[15:0]),
        .out(sign_ext_out)
    );

    mux2to1 #(.WIDTH(32)) mux3_inst (
        .in0(DR2),
        .in1(sign_ext_out),
        .sel(ALU_Src),
        .out(alu_b)
    );

    alu_control alu_ctrl_inst (
        .alu_op(ALU_Op),
        .funct(instruction[5:0]),
        .alu_ctrl(alu_ctrl)
    );

    alu alu_inst (
        .a(DR1),
        .b(alu_b),
        .alu_ctrl(alu_ctrl),
        .result(alu_result),
        .zf(zf)
    );

    data_mem data_mem_inst (
        .clk(clk),
        .rst(rst),
        .MemRead(MemRead),
        .MemWrite(MemWrite),
        .Address_In(alu_result),
        .Data_In(DR2),
        .Lectura(mem_read_data)
    );

    mux2to1 #(.WIDTH(32)) mux1_inst (
        .in0(alu_result),
        .in1(mem_read_data),
        .sel(MemToReg),
        .out(DW)
    );

    shift_left_2 #(.IN_WIDTH(32), .OUT_WIDTH(32)) shift_branch_inst (
        .in(sign_ext_out),
        .out(branch_offset_shifted)
    );

    adder #(.WIDTH(32)) adder_branch_inst (
        .a(pc_plus_4),
        .b(branch_offset_shifted),
        .sum(branch_target)
    );

    and_gate and_gate_inst (
        .a(Branch),
        .b(zf),
        .out(pc_src)
    );

    mux2to1 #(.WIDTH(32)) mux4_inst (
        .in0(pc_plus_4),
        .in1(branch_target),
        .sel(pc_src),
        .out(mux4_out)
    );

    shift_left_2 #(.IN_WIDTH(26), .OUT_WIDTH(28)) shift_jump_inst (
        .in(instruction[25:0]),
        .out(jump_addr_28)
    );

    mux2to1 #(.WIDTH(32)) mux5_inst (
        .in0(mux4_out),
        .in1(jump_target_32),
        .sel(Jump),
        .out(next_pc)
    );

endmodule
