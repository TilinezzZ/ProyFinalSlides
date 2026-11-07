export interface WirePath {
  id: string
  label: string
  bits: string
  isControl?: boolean
  sourceComponentId: string
  targetComponentId: string
  // SVG path command (d attribute)
  d: string
  // Color classification
  colorType: 'data' | 'control' | 'address' | 'feedback'
}

export const WIRES: WirePath[] = [
  // 1. PC out -> Memoria de Instrucciones
  {
    id: 'pc_to_imem',
    label: 'PC [31:0]',
    bits: '32 bits',
    sourceComponentId: 'pc',
    targetComponentId: 'instruction_mem',
    d: 'M 120 375 L 170 375',
    colorType: 'address'
  },
  // 2. PC out -> Sumador PC+4
  {
    id: 'pc_to_adder_pc4',
    label: 'PC [31:0]',
    bits: '32 bits',
    sourceComponentId: 'pc',
    targetComponentId: 'adder_pc4',
    d: 'M 140 375 L 140 197 L 180 197',
    colorType: 'address'
  },
  // 3. Sumador PC+4 out -> Mux4 (Branch mux entrada 0)
  {
    id: 'adder_pc4_to_mux4',
    label: 'PC+4 [31:0]',
    bits: '32 bits',
    sourceComponentId: 'adder_pc4',
    targetComponentId: 'mux4',
    d: 'M 265 197 L 300 197 L 300 140 L 880 140',
    colorType: 'address'
  },
  // 4. Sumador PC+4 out -> Sumador Branch entrada 0
  {
    id: 'adder_pc4_to_adder_br',
    label: 'PC+4',
    bits: '32 bits',
    sourceComponentId: 'adder_pc4',
    targetComponentId: 'adder_branch',
    d: 'M 300 175 L 670 175',
    colorType: 'address'
  },
  // 5. Sumador PC+4 bits [31:28] -> Jump target Mux5
  {
    id: 'adder_pc4_top_bits',
    label: 'PC+4[31:28]',
    bits: '4 bits',
    sourceComponentId: 'adder_pc4',
    targetComponentId: 'mux5',
    d: 'M 300 140 L 300 70 L 930 70 L 930 90 L 970 90',
    colorType: 'address'
  },
  // 6. Memoria de Instrucciones out -> Unidad de Control op [31:26]
  {
    id: 'instr_to_ctrl',
    label: 'op [31:26]',
    bits: '6 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'control_unit',
    d: 'M 280 350 L 310 350 L 310 140 L 340 140',
    colorType: 'control'
  },
  // 7. Instrucción [25:0] -> Shift Left (jump)
  {
    id: 'instr_jump_to_shift_j',
    label: 'target [25:0]',
    bits: '26 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'shift_jump',
    d: 'M 290 350 L 290 45 L 330 45',
    colorType: 'address'
  },
  // 8. Shift Left (jump) out -> Mux5
  {
    id: 'shift_jump_out',
    label: 'target<<2 [27:0]',
    bits: '28 bits',
    sourceComponentId: 'shift_jump',
    targetComponentId: 'mux5',
    d: 'M 415 45 L 940 45 L 940 90 L 970 90',
    colorType: 'address'
  },
  // 9. Instrucción [25:21] -> Banco de Registros AR1 (rs)
  {
    id: 'instr_rs_to_rf',
    label: 'rs [25:21]',
    bits: '5 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'register_file',
    d: 'M 280 365 L 320 365 L 320 340 L 410 340',
    colorType: 'data'
  },
  // 10. Instrucción [20:16] -> Banco de Registros AR2 (rt)
  {
    id: 'instr_rt_to_rf',
    label: 'rt [20:16]',
    bits: '5 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'register_file',
    d: 'M 280 375 L 410 375',
    colorType: 'data'
  },
  // 11. Instrucción [20:16] -> Mux2 entrada 0
  {
    id: 'instr_rt_to_mux2',
    label: 'rt [20:16]',
    bits: '5 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'mux2',
    d: 'M 300 375 L 300 460 L 330 460',
    colorType: 'data'
  },
  // 12. Instrucción [15:11] -> Mux2 entrada 1
  {
    id: 'instr_rd_to_mux2',
    label: 'rd [15:11]',
    bits: '5 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'mux2',
    d: 'M 280 415 L 305 415 L 305 495 L 330 495',
    colorType: 'data'
  },
  // 13. Mux2 out -> Banco de Registros AW
  {
    id: 'mux2_out',
    label: 'AW [4:0]',
    bits: '5 bits',
    sourceComponentId: 'mux2',
    targetComponentId: 'register_file',
    d: 'M 375 480 L 390 480 L 390 430 L 410 430',
    colorType: 'data'
  },
  // 14. Instrucción [15:0] -> Sign Ext
  {
    id: 'instr_imm_to_sign_ext',
    label: 'imm [15:0]',
    bits: '16 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'sign_ext',
    d: 'M 280 435 L 295 435 L 295 555 L 410 555',
    colorType: 'data'
  },
  // 15. Sign Ext out -> Mux3 entrada 1
  {
    id: 'sign_ext_to_mux3',
    label: 'SignExt [31:0]',
    bits: '32 bits',
    sourceComponentId: 'sign_ext',
    targetComponentId: 'mux3',
    d: 'M 500 555 L 540 555 L 540 470 L 570 470',
    colorType: 'data'
  },
  // 16. Sign Ext out -> Shift Left (branch)
  {
    id: 'sign_ext_to_shift_br',
    label: 'SignExt [31:0]',
    bits: '32 bits',
    sourceComponentId: 'sign_ext',
    targetComponentId: 'shift_branch',
    d: 'M 520 555 L 520 222 L 550 222',
    colorType: 'data'
  },
  // 17. Shift Left (branch) out -> Sumador de Branch entrada 1
  {
    id: 'shift_br_out',
    label: 'offset<<2',
    bits: '32 bits',
    sourceComponentId: 'shift_branch',
    targetComponentId: 'adder_branch',
    d: 'M 630 222 L 670 215',
    colorType: 'address'
  },
  // 18. Sumador de Branch out -> Mux4 entrada 1
  {
    id: 'adder_br_out_to_mux4',
    label: 'Branch Target',
    bits: '32 bits',
    sourceComponentId: 'adder_branch',
    targetComponentId: 'mux4',
    d: 'M 755 197 L 850 197 L 850 180 L 880 180',
    colorType: 'address'
  },
  // 19. Banco de Registros DR1 -> ALU entrada A
  {
    id: 'rf_dr1_to_alu',
    label: 'DR1 [31:0]',
    bits: '32 bits',
    sourceComponentId: 'register_file',
    targetComponentId: 'alu',
    d: 'M 530 350 L 650 370',
    colorType: 'data'
  },
  // 20. Banco de Registros DR2 -> Mux3 entrada 0
  {
    id: 'rf_dr2_to_mux3',
    label: 'DR2 [31:0]',
    bits: '32 bits',
    sourceComponentId: 'register_file',
    targetComponentId: 'mux3',
    d: 'M 530 420 L 570 430',
    colorType: 'data'
  },
  // 21. Banco de Registros DR2 -> Memoria de Datos Data_In
  {
    id: 'rf_dr2_to_dmem',
    label: 'DR2 [31:0]',
    bits: '32 bits',
    sourceComponentId: 'register_file',
    targetComponentId: 'data_mem',
    d: 'M 545 420 L 545 490 L 780 490 L 780 440 L 800 440',
    colorType: 'data'
  },
  // 22. Mux3 out -> ALU entrada B
  {
    id: 'mux3_out',
    label: 'ALU B [31:0]',
    bits: '32 bits',
    sourceComponentId: 'mux3',
    targetComponentId: 'alu',
    d: 'M 615 450 L 650 440',
    colorType: 'data'
  },
  // 23. Instrucción [5:0] -> ALU Control funct
  {
    id: 'instr_funct_to_alu_ctrl',
    label: 'funct [5:0]',
    bits: '6 bits',
    sourceComponentId: 'instruction_mem',
    targetComponentId: 'alu_control',
    d: 'M 280 445 L 290 445 L 290 575 L 620 575',
    colorType: 'control'
  },
  // 24. ALU Control out -> ALU
  {
    id: 'alu_ctrl_out',
    label: 'Operación [2:0]',
    bits: '3 bits',
    isControl: true,
    sourceComponentId: 'alu_control',
    targetComponentId: 'alu',
    d: 'M 670 520 L 670 470 L 697 470',
    colorType: 'control'
  },
  // 25. ALU out -> Memoria de Datos Address_In
  {
    id: 'alu_out_to_dmem',
    label: 'ALU Result [31:0]',
    bits: '32 bits',
    sourceComponentId: 'alu',
    targetComponentId: 'data_mem',
    d: 'M 745 400 L 770 400 L 770 380 L 800 380',
    colorType: 'data'
  },
  // 26. ALU out -> Mux1 entrada 0
  {
    id: 'alu_out_to_mux1',
    label: 'ALU Result',
    bits: '32 bits',
    sourceComponentId: 'alu',
    targetComponentId: 'mux1',
    d: 'M 770 400 L 770 320 L 940 320 L 940 380 L 960 380',
    colorType: 'data'
  },
  // 27. ALU zf out -> Compuerta AND
  {
    id: 'alu_zf_to_and',
    label: 'zf (Zero Flag)',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'alu',
    targetComponentId: 'and_gate',
    d: 'M 745 360 L 760 360 L 760 150 L 780 150',
    colorType: 'control'
  },
  // 28. Memoria de Datos out -> Mux1 entrada 1
  {
    id: 'dmem_out_to_mux1',
    label: 'Lectura [31:0]',
    bits: '32 bits',
    sourceComponentId: 'data_mem',
    targetComponentId: 'mux1',
    d: 'M 910 400 L 935 400 L 935 425 L 960 425',
    colorType: 'data'
  },
  // 29. Mux1 out -> Banco de Registros DW (Bus largo de retorno)
  {
    id: 'mux1_out_to_dw',
    label: 'DW [31:0]',
    bits: '32 bits',
    sourceComponentId: 'mux1',
    targetComponentId: 'register_file',
    d: 'M 1005 405 L 1030 405 L 1030 620 L 390 620 L 390 460 L 410 460',
    colorType: 'feedback'
  },
  // 30. Compuerta AND out -> Mux4 control (PCSrc)
  {
    id: 'and_out_to_mux4',
    label: 'PCSrc',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'and_gate',
    targetComponentId: 'mux4',
    d: 'M 845 140 L 880 125',
    colorType: 'control'
  },
  // 31. Mux4 out -> Mux5 entrada 0
  {
    id: 'mux4_out_to_mux5',
    label: 'Mux4 Out',
    bits: '32 bits',
    sourceComponentId: 'mux4',
    targetComponentId: 'mux5',
    d: 'M 925 160 L 950 160 L 950 130 L 970 130',
    colorType: 'address'
  },
  // 32. Mux5 out -> PC input next_pc (Bus superior de retorno)
  {
    id: 'mux5_out_to_pc',
    label: 'Next PC [31:0]',
    bits: '32 bits',
    sourceComponentId: 'mux5',
    targetComponentId: 'pc',
    d: 'M 1015 110 L 1040 110 L 1040 10 L 15 10 L 15 375 L 40 375',
    colorType: 'feedback'
  },
  // 33. Control RegDst -> Mux2
  {
    id: 'ctrl_regdst',
    label: 'RegDst',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'mux2',
    d: 'M 360 240 L 360 440',
    colorType: 'control'
  },
  // 34. Control en_BR -> Banco de Registros
  {
    id: 'ctrl_en_br',
    label: 'en_BR',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'register_file',
    d: 'M 430 240 L 430 310',
    colorType: 'control'
  },
  // 35. Control ALU_Src -> Mux3
  {
    id: 'ctrl_alu_src',
    label: 'ALU_Src',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'mux3',
    d: 'M 460 180 L 590 180 L 590 410',
    colorType: 'control'
  },
  // 36. Control ALU_Op -> ALU Control
  {
    id: 'ctrl_alu_op',
    label: 'ALU Op [1:0]',
    bits: '2 bits',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'alu_control',
    d: 'M 460 210 L 610 210 L 610 535 L 620 535',
    colorType: 'control'
  },
  // 37. Control MemRead -> Memoria de Datos
  {
    id: 'ctrl_mem_read',
    label: 'MemRead',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'data_mem',
    d: 'M 460 130 L 820 130 L 820 340',
    colorType: 'control'
  },
  // 38. Control MemWrite -> Memoria de Datos
  {
    id: 'ctrl_mem_write',
    label: 'MemWrite',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'data_mem',
    d: 'M 460 150 L 850 150 L 850 340',
    colorType: 'control'
  },
  // 39. Control MemToReg -> Mux1
  {
    id: 'ctrl_mem_to_reg',
    label: 'MemToReg',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'mux1',
    d: 'M 460 110 L 980 110 L 980 360',
    colorType: 'control'
  },
  // 40. Control Branch -> Compuerta AND
  {
    id: 'ctrl_branch',
    label: 'Branch',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'and_gate',
    d: 'M 460 95 L 780 95 L 780 125',
    colorType: 'control'
  },
  // 41. Control Jump -> Mux5
  {
    id: 'ctrl_jump',
    label: 'Jump',
    bits: '1 bit',
    isControl: true,
    sourceComponentId: 'control_unit',
    targetComponentId: 'mux5',
    d: 'M 370 80 L 370 30 L 990 30 L 990 70',
    colorType: 'control'
  }
]
