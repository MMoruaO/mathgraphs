# MathGraphs — Project Handoff

Este documento da contexto a futuras sesiones de desarrollo. Resume el propósito del juego, sus límites matemáticos, la arquitectura actual y el estado de trabajo conocido. No sustituye las especificaciones: antes de modificar reglas o semántica, consultar `GAME_RULES.md`, `MATH_SPEC.md` y `ARCHITECTURE.md`.

## Propósito

MathGraphs es un juego web gratuito de rompecabezas de razonamiento matemático, orientado a estudiantes universitarios y personas que disfrutan descubrir relaciones entre conceptos. El objetivo es que el jugador deduzca conexiones matemáticas; no convertir el producto en un examen, una colección de flashcards ni un juego de cálculo aritmético.

La visión a largo plazo contempla un reto diario compartido, archivo de retos y práctica por tema y dificultad. Son objetivos futuros: no implican autorización para añadir ahora backend, cuentas, generación automática, monetización o infraestructura adicional.

## Mecánica actual

- El tablero contiene posiciones fijas, fichas matemáticas movibles y aristas que representan relaciones tipadas.
- El jugador intercambia fichas entre posiciones; la topología del grafo permanece fija.
- Puede deshacer y reiniciar. La evaluación se solicita explícitamente con el botón de comprobar; no debe revelarse tras cada movimiento.
- Se acepta cualquier asignación que satisfaga las restricciones. No se compara contra una permutación predeterminada.
- Puede haber varias soluciones legítimas.

## Integridad matemática

Es el requisito prioritario. Las proposiciones tienen identificadores semánticos estables independientes de su presentación LaTeX. El motor consulta un catálogo curado y explícito bajo supuestos de puzzle.

Los resultados relevantes incluyen `verified`, `not_verified`, `invalid` e `incomplete`. `not_verified` significa que el catálogo actual no justifica la relación; no prueba que sea falsa. No fusionar `not_verified` con `invalid`, ni inferir teoremas mediante comparación de cadenas, patrones de fórmulas o supuestos tácitos. Las hipótesis globales del problema deben mantenerse separadas de las fichas movibles.

Los conteos del solver se entienden respecto al catálogo curado, no como prueba universal de un teorema. Cada nueva relación matemática necesita justificación y revisión humana antes de publicarse.

## Arquitectura y herramientas

- Aplicación estática: React, TypeScript, Vite, `@xyflow/react` y KaTeX.
- `src/core/`: modelos, catálogo, validador y solver puros, independientes de React, DOM y navegador.
- `src/data/`: catálogo maestro, registro y puzzles declarativos JSON.
- `src/state/`: estado de selección, intercambios, undo/reset y solicitudes de validación.
- `src/components/`: presentación e interacción del navegador.
- `src/i18n.ts`: traducciones de interfaz y persistencia de idioma español/inglés. Las fichas y explicaciones de los puzzles también tienen presentación localizada; no basta traducir solo los controles.
- `tests/`: pruebas unitarias con Vitest y pruebas de interacción en navegador con Playwright.

Mantener separadas la semántica matemática, los datos de puzzles, el estado de juego y la interfaz. JSON es el formato actual de los puzzles curados. No añadir un servidor o base de datos para resolver necesidades que la aplicación estática ya puede cubrir.

## Estado conocido del proyecto

**Verificado en el repositorio:** la rama es `main` y el último commit (`HEAD`) es `f49016a feat: add curated multi-puzzle library`, alineado con `origin/main`. Hay cuatro definiciones de puzzle en `src/data/puzzles/`: álgebra lineal de idempotencia, invertibilidad en álgebra lineal, jerarquía de análisis y compacidad en topología. La interfaz permite seleccionar puzzles y alternar español/inglés.

**Trabajo local aún sin commit según el último estado inspeccionado:** cambios de internacionalización de la interfaz y del contenido matemático, documentación relacionada, cobertura E2E del cambio de idioma y un rediseño visual monocromático retro/académico. Incluyen `src/i18n.ts`, modificaciones de componentes/datos/estilos y una prueba E2E. Confirmar siempre `git status` al iniciar; no asumir que estos cambios ya están publicados.

**Comprobaciones ejecutadas recientemente:**

- `npm run build`: completó correctamente (TypeScript y build de Vite). Vite advierte que el bundle JS principal supera 500 kB minificado; es una advertencia de tamaño, no un fallo.
- `npm test`: 45 pruebas pasaron.
- `npm run test:e2e -- --output=/tmp/mathgraphs-retro-playwright`: 8 pruebas de navegador pasaron, incluidos flujos de juego e idioma.
- `git diff --check`: pasó.

Los resultados anteriores describen esa revisión reciente; volver a ejecutarlos si el estado del árbol cambió. En particular, React Flow ha tenido antes un fallo de doble manejo de clic que seleccionaba y deseleccionaba una ficha de inmediato. Las pruebas unitarias no sustituyen verificar las interacciones reales.

## Dirección recomendada

El siguiente trabajo debe consolidar la biblioteca pequeña de puzzles antes de ampliar el producto:

1. Revisar cada puzzle con un argumento matemático claro, supuestos explícitos y explicación comprensible en ambos idiomas.
2. Verificar automáticamente integridad de datos, satisfacibilidad y conjunto/conteo de soluciones respecto al catálogo aprobado; revisar con cuidado simetrías y soluciones no intencionadas.
3. Evaluar calidad de juego: deducciones necesarias, direccionalidad de las relaciones, dificultad conceptual y si el grafo promueve razonamiento en vez de prueba aleatoria.
4. Mejorar pruebas de navegador para interacción de selección/intercambio, undo/reset, comprobar, cambio de puzzle y ambas traducciones.
5. Elegir un primer puzzle que sea entretenido, además de válido, antes de tratar el puzzle de referencia técnica como nivel final.

No añadir hiperaristas o premisas compuestas hasta que se acuerde una ampliación formal del modelo. Por ejemplo, algunas implicaciones necesitan conjuntamente `P` y `Q` como premisas, algo que el modelo actual de arista binaria no expresa.

## Forma de trabajar

- Comunicar en español; mantener inglés para identificadores de código y mensajes de commit.
- Inspeccionar el árbol y las especificaciones antes de editar; señalar contradicciones en vez de resolverlas silenciosamente.
- Hacer cambios pequeños, tipados y revisables, con pruebas y documentación pertinentes.
- No modificar reglas matemáticas para hacer pasar un test ni publicar afirmaciones no verificadas.
- No hacer commit, push o deploy sin autorización explícita.
- Al reportar, distinguir hallazgos verificados, supuestos y propuestas; incluir comandos y resultados reales.

## Comandos locales

Desde el directorio del proyecto:

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
npm run build
```
