import { loadPyodide, type PyodideInterface } from 'pyodide';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

interface CodeExercise {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput?: string;
  hints: string[];
  validation?: (output: string) => boolean;
}

export class CodeExecutor {
  private pyodide: PyodideInterface | null = null;
  private isLoading = false;
  private loadPromise: Promise<PyodideInterface> | null = null;
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private interruptBuffer: Uint8Array | null = null;

  // Initialize Pyodide (lazy loading)
  async initialize(): Promise<void> {
    if (this.pyodide) return;
    if (this.isLoading) {
      await this.loadPromise;
      return;
    }

    this.isLoading = true;
    this.loadPromise = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
    });

    try {
      this.pyodide = await this.loadPromise;
      console.log('[CodeExecutor] Pyodide loaded successfully');
    } catch (error) {
      console.error('[CodeExecutor] Failed to load Pyodide:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Execute Python code with timeout protection
  async executePython(code: string, timeoutMs = this.DEFAULT_TIMEOUT): Promise<ExecutionResult> {
    await this.initialize();

    const startTime = performance.now();
    let output = '';
    let error = '';
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      if (!this.pyodide) {
        throw new Error('Pyodide not initialized');
      }

      // Set up interrupt buffer for timeout
      this.interruptBuffer = new Uint8Array(1);
      this.pyodide.setInterruptBuffer(this.interruptBuffer);

      // Redirect stdout/stderr
      this.pyodide.setStdout({ batched: (text: string) => {
        output += text + '\n';
      }});

      this.pyodide.setStderr({ batched: (text: string) => {
        error += text + '\n';
      }});

      // Set timeout to interrupt execution
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (this.interruptBuffer) {
            this.interruptBuffer[0] = 2; // Signal interrupt to Pyodide
          }
          reject(new Error(`Execution timeout: El código excedió ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Run the code with race against timeout
      const executionPromise = this.pyodide.runPythonAsync(code);
      
      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      // Clear timeout if execution completed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // If there's a return value, add it to output
      if (result !== undefined && result !== null) {
        output += String(result) + '\n';
      }

      const executionTime = performance.now() - startTime;

      return {
        success: !error,
        output: output.trim(),
        error: error.trim() || undefined,
        executionTime: Math.round(executionTime),
      };
    } catch (err) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      const executionTime = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Provide user-friendly timeout message
      if (errorMessage.includes('timeout')) {
        return {
          success: false,
          output: output.trim(),
          error: `⏱️ El código tomó demasiado tiempo (>${timeoutMs}ms).\n💡 Revisa si tienes un bucle infinito o una operación muy pesada.`,
          executionTime: Math.round(executionTime),
        };
      }

      return {
        success: false,
        output: output.trim(),
        error: errorMessage,
        executionTime: Math.round(executionTime),
      };
    } finally {
      // Reset interrupt buffer
      this.interruptBuffer = null;
    }
  }

  // Validate code against expected output
  async validateExercise(
    code: string,
    exercise: CodeExercise,
    timeoutMs?: number
  ): Promise<{ correct: boolean; feedback: string; result: ExecutionResult }> {
    const result = await this.executePython(code, timeoutMs);

    if (!result.success) {
      return {
        correct: false,
        feedback: `El código tiene un error:\n\`\`\`\n${result.error}\n\`\`\``,
        result,
      };
    }

    // Check expected output
    if (exercise.expectedOutput) {
      const normalizedOutput = result.output.trim();
      const normalizedExpected = exercise.expectedOutput.trim();

      if (normalizedOutput === normalizedExpected) {
        return {
          correct: true,
          feedback: '✅ ¡Correcto! El output coincide exactamente.',
          result,
        };
      }

      // Partial match
      if (normalizedOutput.includes(normalizedExpected) || 
          normalizedExpected.includes(normalizedOutput)) {
        return {
          correct: true,
          feedback: '✅ Correcto, aunque el formato es ligeramente diferente.',
          result,
        };
      }

      return {
        correct: false,
        feedback: `❌ El output no coincide.\n\nEsperado:\n\`\`\`\n${exercise.expectedOutput}\n\`\`\`\n\nRecibido:\n\`\`\`\n${result.output}\n\`\`\``,
        result,
      };
    }

    // Custom validation
    if (exercise.validation) {
      const isValid = exercise.validation(result.output);
      return {
        correct: isValid,
        feedback: isValid 
          ? '✅ ¡Correcto! Tu solución cumple los requisitos.'
          : '❌ Tu solución no cumple todos los requisitos. Revisa la consigna.',
        result,
      };
    }

    // Just check if it runs without errors
    return {
      correct: true,
      feedback: '✅ El código ejecutó sin errores.',
      result,
    };
  }

  // Get a hint for the exercise
  getHint(exercise: CodeExercise, attemptNumber: number): string {
    if (attemptNumber === 0) {
      return exercise.hints[0] || 'Lee cuidadosamente la consigna.';
    }
    
    const hintIndex = Math.min(attemptNumber, exercise.hints.length - 1);
    return exercise.hints[hintIndex] || exercise.hints[exercise.hints.length - 1];
  }
}

// Exercise library
export const EXERCISE_LIBRARY: Record<string, CodeExercise[]> = {
  python: [
    {
      id: 'py-hello',
      title: 'Hello World',
      description: 'Imprime "Hello, World!" en la consola.',
      starterCode: '# Escribe tu código aquí\n',
      expectedOutput: 'Hello, World!',
      hints: [
        'Usa la función print() para mostrar texto.',
        'print("Hello, World!")',
      ],
    },
    {
      id: 'py-variables',
      title: 'Variables y Tipos',
      description: 'Crea una variable "nombre" con tu nombre y otra "edad" con tu edad. Imprime ambas.',
      starterCode: '# Define tus variables\n\n# Imprime las variables\n',
      expectedOutput: '',
      hints: [
        'nombre = "Tu Nombre"\nedad = 25',
        'Usa print(nombre) y print(edad)',
      ],
      validation: (output) => output.length > 0 && output.split('\n').length >= 2,
    },
    {
      id: 'py-sum',
      title: 'Suma de Dos Números',
      description: 'Crea dos variables a=5 y b=3, calcula su suma e imprime el resultado.',
      starterCode: 'a = 5\nb = 3\n\n# Calcula la suma\n\n# Imprime el resultado\n',
      expectedOutput: '8',
      hints: [
        'suma = a + b',
        'print(suma)',
      ],
    },
    {
      id: 'py-loop',
      title: 'Bucle For',
      description: 'Imprime los números del 1 al 5 usando un bucle for.',
      starterCode: '# Usa range(1, 6) para obtener números del 1 al 5\n\n',
      expectedOutput: '1\n2\n3\n4\n5',
      hints: [
        'for i in range(1, 6):',
        '    print(i)',
      ],
    },
    {
      id: 'py-function',
      title: 'Tu Primera Función',
      description: 'Crea una función saludar(nombre) que retorne "Hola, {nombre}!". Llámala con "Mundo".',
      starterCode: 'def saludar(nombre):\n    # Completa aquí\n    pass\n\n# Llama a la función\nprint(saludar("Mundo"))',
      expectedOutput: 'Hola, Mundo!',
      hints: [
        'def saludar(nombre):\n    return "Hola, " + nombre + "!"',
        'O usa f-strings: return f"Hola, {nombre}!"',
      ],
    },
  ],
};

// Singleton instance
export const codeExecutor = new CodeExecutor();
