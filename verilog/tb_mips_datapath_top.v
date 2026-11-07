// ============================================================================
// Proyecto: Procesador MIPS Monociclo de 32 bits (Diapositiva 17)
// Testbench: tb_mips_datapath_top (Simulación del Datapath Completo)
// Seminario de Solución de Problemas de Arquitectura de Computadoras - CUCEI
// ============================================================================
`timescale 1ns / 1ps

module tb_mips_datapath_top;

    reg         clk;
    reg         rst;

    // Señales de monitoreo
    wire [31:0] pc_out;
    wire [31:0] instruction;
    wire [4:0]  AR1;
    wire [4:0]  AR2;
    wire [4:0]  AW;
    wire [31:0] DR1;
    wire [31:0] DR2;
    wire [31:0] DW;
    wire        en_BR;
    wire [31:0] alu_result;
    wire        zf;
    wire [31:0] mem_read_data;
    wire [31:0] next_pc;

    // Instancia del Datapath Top-Level
    mips_datapath_top uut (
        .clk(clk),
        .rst(rst),
        .pc_out(pc_out),
        .instruction(instruction),
        .AR1(AR1),
        .AR2(AR2),
        .AW(AW),
        .DR1(DR1),
        .DR2(DR2),
        .DW(DW),
        .en_BR(en_BR),
        .alu_result(alu_result),
        .zf(zf),
        .mem_read_data(mem_read_data),
        .next_pc(next_pc)
    );

    // Reloj con período de 10ns (frecuencia = 100MHz)
    always #5 clk = ~clk;

    initial begin
        $display("====================================================================");
        $display("INICIANDO SIMULACION DEL DATAPATH COMPLETO MIPS 32-BIT (SLIDE 17)");
        $display("Universidad de Guadalajara - CUCEI");
        $display("====================================================================");

        // Inicialización
        clk = 0;
        rst = 1;
        #15;
        rst = 0;

        // --------------------------------------------------------------------
        // CICLO 1: add $t0, $s1, $s2  (PC = 0x00400000)
        // Suma $s1 (25) + $s2 (15) = 40, escribe en $t0 ($8)
        // --------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("[CICLO 1] PC=0x%h | Instr=0x%h (add $t0, $s1, $s2)", pc_out, instruction);
        $display("          DR1=%d | DR2=%d | ALU Result=%d | DW=%d | AW=$%d | en_BR=%b",
                 DR1, DR2, alu_result, DW, AW, en_BR);
        if (alu_result == 32'd40 && AW == 5'd8 && en_BR == 1'b1) begin
            $display("          >>> ACIERTO: Instruccion add ejecutada correctamente.");
        end else begin
            $error("          >>> ERROR en ejecucion de add.");
        end

        // --------------------------------------------------------------------
        // CICLO 2: sw $t0, 8($s1)  (PC = 0x00400004)
        // Guarda $t0 (40) en memoria en ($s1 + 8) = 25 + 8 = 33
        // --------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("[CICLO 2] PC=0x%h | Instr=0x%h (sw $t0, 8($s1))", pc_out, instruction);
        $display("          Direccion Memoria (ALU)=%d | Dato a Guardar (DR2)=%d",
                 alu_result, DR2);
        if (alu_result == 32'd33 && DR2 == 32'd40) begin
            $display("          >>> ACIERTO: sw calculo direccion 33 y almacena dato 40.");
        end else begin
            $error("          >>> ERROR en ejecucion de sw.");
        end

        // --------------------------------------------------------------------
        // CICLO 3: lw $t1, 8($s1)  (PC = 0x00400008)
        // Lee de memoria en ($s1 + 8 = 33) y carga en $t1 ($9)
        // --------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("[CICLO 3] PC=0x%h | Instr=0x%h (lw $t1, 8($s1))", pc_out, instruction);
        $display("          Direccion Lectura=%d | Dato Leido=%d | AW=$%d | en_BR=%b",
                 alu_result, mem_read_data, AW, en_BR);
        if (alu_result == 32'd33 && mem_read_data == 32'd40 && AW == 5'd9) begin
            $display("          >>> ACIERTO: lw recupero valor 40 hacia el registro $t1.");
        end else begin
            $error("          >>> ERROR en ejecucion de lw.");
        end

        // --------------------------------------------------------------------
        // CICLO 4: beq $t0, $t1, 1  (PC = 0x0040000C)
        // Compara $t0 (40) con $t1 (40). Como son iguales, zf=1 y salta!
        // --------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("[CICLO 4] PC=0x%h | Instr=0x%h (beq $t0, $t1, 1)", pc_out, instruction);
        $display("          Comparacion: $t0=%d, $t1=%d | zf=%b | Next_PC=0x%h",
                 DR1, DR2, zf, next_pc);
        if (zf == 1'b1 && next_pc == 32'h00400014) begin
            $display("          >>> ACIERTO: beq detecto igualdad (zf=1) y tomo el salto a 0x00400014.");
        end else begin
            $error("          >>> ERROR en ejecucion de beq.");
        end

        // --------------------------------------------------------------------
        // CICLO 5: j 0x00400020  (PC = 0x00400014 - Se evadio la instruccion en 0x00400010)
        // Salto incondicional a la direccion objetivo
        // --------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("[CICLO 5] PC=0x%h | Instr=0x%h (j 0x00400020)", pc_out, instruction);
        $display("          Salto Incondicional | Next_PC=0x%h", next_pc);
        if (next_pc == 32'h00400020) begin
            $display("          >>> ACIERTO: j configuro next_pc en 0x00400020 exitosamente.");
        end else begin
            $error("          >>> ERROR en ejecucion de j.");
        end

        @(posedge clk);
        #1;
        $display("[CICLO 6] PC en destino de salto: 0x%h", pc_out);

        $display("====================================================================");
        $display("TODAS LAS INSTRUCCIONES (add, sw, lw, beq, j) EJECUTADAS CON EXITO!");
        $display("Simulacion finalizada correctamente.");
        $display("====================================================================");
        $finish;
    end

endmodule
