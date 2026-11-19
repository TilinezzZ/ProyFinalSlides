vlib work
vmap work work
vlog -work work pc.v
vlog -work work adder.v
vlog -work work instruction_mem.v
vlog -work work control_unit.v
vlog -work work mux2to1.v
vlog -work work register_file.v
vlog -work work sign_ext.v
vlog -work work alu.v
vlog -work work alu_control.v
vlog -work work data_mem.v
vlog -work work shift_left_2.v
vlog -work work and_gate.v
vlog -work work mips_datapath_top.v
vlog -work work tb_mips_datapath_top.v
vsim -voptargs=+acc work.tb_mips_datapath_top
onerror {resume}
quietly WaveActivateNextPane {} 0
add wave -noupdate -divider {RELOJ Y RESET}
add wave -noupdate -color Cyan /tb_mips_datapath_top/clk
add wave -noupdate -color Red /tb_mips_datapath_top/rst
add wave -noupdate -divider {ETAPA FETCH}
add wave -noupdate -radix hexadecimal /tb_mips_datapath_top/pc_out
add wave -noupdate -radix hexadecimal /tb_mips_datapath_top/instruction
add wave -noupdate -radix hexadecimal /tb_mips_datapath_top/uut/pc_plus_4
add wave -noupdate -divider {SEÑALES DE CONTROL}
add wave -noupdate -color Yellow /tb_mips_datapath_top/en_BR
add wave -noupdate /tb_mips_datapath_top/uut/RegDst
add wave -noupdate /tb_mips_datapath_top/uut/ALU_Src
add wave -noupdate -radix binary /tb_mips_datapath_top/uut/ALU_Op
add wave -noupdate /tb_mips_datapath_top/uut/MemToReg
add wave -noupdate /tb_mips_datapath_top/uut/MemRead
add wave -noupdate /tb_mips_datapath_top/uut/MemWrite
add wave -noupdate /tb_mips_datapath_top/uut/Branch
add wave -noupdate /tb_mips_datapath_top/uut/Jump
add wave -noupdate -divider {BANCO DE REGISTROS}
add wave -noupdate -radix decimal /tb_mips_datapath_top/AR1
add wave -noupdate -radix decimal /tb_mips_datapath_top/AR2
add wave -noupdate -radix decimal /tb_mips_datapath_top/AW
add wave -noupdate -radix decimal -color Green /tb_mips_datapath_top/DR1
add wave -noupdate -radix decimal -color Green /tb_mips_datapath_top/DR2
add wave -noupdate -radix decimal -color Orange /tb_mips_datapath_top/DW
add wave -noupdate -divider {ETAPA ALU}
add wave -noupdate -radix binary /tb_mips_datapath_top/uut/alu_ctrl
add wave -noupdate -radix decimal /tb_mips_datapath_top/uut/alu_b
add wave -noupdate -radix decimal -color Cyan /tb_mips_datapath_top/alu_result
add wave -noupdate -color Magenta /tb_mips_datapath_top/zf
add wave -noupdate -divider {MEMORIA DE DATOS}
add wave -noupdate -radix decimal /tb_mips_datapath_top/uut/data_mem_inst/Address_In
add wave -noupdate -radix decimal /tb_mips_datapath_top/uut/data_mem_inst/Data_In
add wave -noupdate -radix decimal /tb_mips_datapath_top/mem_read_data
add wave -noupdate -divider {SALTOS (BRANCH Y JUMP)}
add wave -noupdate -radix hexadecimal /tb_mips_datapath_top/uut/branch_target
add wave -noupdate /tb_mips_datapath_top/uut/pc_src
add wave -noupdate -radix hexadecimal /tb_mips_datapath_top/uut/jump_target_32
add wave -noupdate -radix hexadecimal -color Gold /tb_mips_datapath_top/next_pc
TreeUpdate [SetDefaultTree]
WaveRestoreCursors {{Cursor 1} {0 ps} 0}
quietly wave cursor active 1
configure wave -namecolwidth 220
configure wave -valuecolwidth 100
configure wave -justifyvalue left
configure wave -signalnamestyle 1
configure wave -timeline 0
configure wave -timelineunits ns
run 120ns
wave zoom full
