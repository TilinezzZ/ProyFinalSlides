// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Módulo: Memoria de Instrucciones (ROM combinacional)
// ============================================================================
`timescale 1ns / 1ps

module instruction_mem (
    input  wire [31:0] addr,           // Dirección suministrada por el PC
    output wire [31:0] instruction     // Palabra de instrucción de 32 bits
);

    // Memoria ROM de 256 palabras de 32 bits
    reg [31:0] rom [0:255];

    initial begin
        // Programa de prueba en código máquina MIPS:
        // PC = 0x00400000 (Índice 0): add $t0, $s1, $s2 ($t0 = $17 + $18 = 25 + 15 = 40)
        rom[0] = 32'h02324020;

        // PC = 0x00400004 (Índice 1): sw $t0, 8($s1)    (Guarda 40 en MEM[25 + 8 = 33])
        rom[1] = 32'hAE280008;

        // PC = 0x00400008 (Índice 2): lw $t1, 8($s1)    (Carga en $t1 el valor en MEM[33])
        rom[2] = 32'h8E290008;

        // PC = 0x0040000C (Índice 3): beq $t0, $t1, 1   (Si $t0 == $t1, salta 1 instr hacia j)
        rom[3] = 32'h11090001;

        // PC = 0x00400010 (Índice 4): add $t2, $zero, $zero (Instrucción evadida por branch)
        rom[4] = 32'h00005020;

        // PC = 0x00400014 (Índice 5): j 0x00400020      (Salto incondicional hacia 0x00400020)
        rom[5] = 32'h08100008;
    end

    // Alineación por palabra (divide la dirección entre 4 con offset base 0x00400000)
    wire [7:0] word_idx = addr[9:2];

    assign instruction = rom[word_idx];

endmodule
