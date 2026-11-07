# Módulos Verilog y Simulación en ModelSim

Procesador MIPS de 32 bits de un solo ciclo fiel al diagrama RTL de la **Diapositiva 17** ("Datapath Completo").

Seminario de Solución de Problemas de Arquitectura de Computadoras  
**Universidad de Guadalajara (CUCEI)**

---

## 📂 Contenido del Directorio

| Módulo RTL | Testbench | Descripción |
| :--- | :--- | :--- |
| `pc.v` | `tb_pc.v` | Contador de Programa (Registro de 32 bits con CLK y Reset). |
| `adder.v` | `tb_adder.v` | Sumador de 32 bits (utilizado para PC+4 y Sumador de Branch). |
| `instruction_mem.v` | `tb_instruction_mem.v` | Memoria ROM con el programa de prueba pregrabado. |
| `control_unit.v` | `tb_control_unit.v` | Decodificador central de señales de control (`en_BR`, `RegDst`, etc.). |
| `mux2to1.v` | `tb_mux2to1.v` | Multiplexor 2:1 parametrizado (Mux1, Mux2, Mux3, Mux4, Mux5). |
| `register_file.v` | `tb_register_file.v` | Banco de 32 registros x 32 bits (lectura asíncrona, escritura sincrónica). |
| `sign_ext.v` | `tb_sign_ext.v` | Extensor de signo 16 → 32 bits para inmediatos y offsets. |
| `alu.v` | `tb_alu.v` | ALU de 32 bits con operaciones (ADD, SUB, AND, OR, SLT, NOR) y `zf`. |
| `alu_control.v` | `tb_alu_control.v` | Decodificador de operación ALU según `ALU_Op` y `funct`. |
| `data_mem.v` | `tb_data_mem.v` | Memoria RAM de lectura/escritura de 32 bits con `MemRead`/`MemWrite`. |
| `shift_left_2.v` | `tb_shift_left_2.v` | Desplazador lógico de 2 bits para branch y jump. |
| `and_gate.v` | `tb_and_gate.v` | Compuerta AND para decisión de bifurcación (`Branch AND zf`). |
| **`mips_datapath_top.v`** | **`tb_mips_datapath_top.v`** | **Datapath completo interconectando los 18 componentes.** |
| **`run_sim.do`** | - | Script de automatización TCL para ModelSim / QuestaSim. |

---

## 🚀 Cómo ejecutar en ModelSim

1. Abre **ModelSim** o **QuestaSim**.
2. Cambia el directorio de trabajo a esta carpeta `/verilog`:
   ```tcl
   cd {ruta/al/proyecto/verilog}
   ```
3. Ejecuta el script `.do`:
   ```tcl
   do run_sim.do
   ```
4. El script compilará automáticamente los 13 módulos, cargará el testbench `tb_mips_datapath_top`, añadirá los grupos de ondas con colores distintivos y correrá la simulación por 120 ns.

---

## 🧪 Programa Ejecutado en el Testbench

El banco de pruebas ejecuta una secuencia de 5 instrucciones fundamentales:

1. `add $t0, $s1, $s2` -> Suma `$s1` (25) + `$s2` (15) = 40, guardando 40 en `$t0`.
2. `sw $t0, 8($s1)` -> Almacena el valor 40 en la dirección de memoria `33` (`25 + 8`).
3. `lw $t1, 8($s1)` -> Lee de memoria la palabra en dirección `33` y carga 40 en `$t1`.
4. `beq $t0, $t1, 1` -> Compara `$t0` (40) y `$t1` (40). Como son iguales (`zf = 1`), toma la bifurcación evadiendo la siguiente instrucción.
5. `j 0x00400020` -> Realiza un salto incondicional a la dirección absoluta `0x00400020`.
