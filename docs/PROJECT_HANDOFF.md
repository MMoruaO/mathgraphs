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
- `src/data/dailySchedule.ts`: fechas UTC y mapeo de retos publicados; fechas futuras aún no publicadas usan `puzzleId: null`.
- `src/state/`: estado de selección, intercambios, undo/reset y solicitudes de validación.
- `src/components/`: presentación e interacción del navegador, incluido el archivo diario.
- `src/i18n.ts`: traducciones de interfaz y persistencia de idioma español/inglés. Las fichas y explicaciones de los puzzles también tienen presentación localizada; no basta traducir solo los controles.
- `tests/`: pruebas unitarias con Vitest y pruebas de interacción en navegador con Playwright.

Mantener separadas la semántica matemática, los datos de puzzles, el estado de juego y la interfaz. JSON es el formato actual de los puzzles curados. No añadir un servidor o base de datos para resolver necesidades que la aplicación estática ya puede cubrir.

## Estado conocido del proyecto

**Último commit publicado antes del piloto diario:** `569c0c5 feat: localize and restyle the game interface`.

**Piloto diario en desarrollo:** calendario fijo de doce días UTC, del 15 al 26 de noviembre de 2026: seis retos archivados (15–20 nov), el reto del 21 nov y cinco fechas futuras bloqueadas. El registro público contiene los retos ya liberados y una entrada reutiliza el puzzle de invertibilidad. Las referencias se muestran tras resolver el puzzle. Los borradores de los cinco retos futuros están guardados localmente en `daily-drafts/`, carpeta ignorada por Git, y no se importan en el catálogo ni en el bundle público. No incluirlos en commits ni subirlos a GitHub antes de publicarlos.

**Trabajo local sin commit:** calendario y archivo diarios, puzzles liberados, relaciones necesarias del catálogo, referencias bibliográficas, traducciones, documentación y pruebas. Las fechas futuras conservan solo el estado bloqueado. Revisar `git status` antes de continuar; no asumir que estos cambios están publicados.

**Comprobaciones ejecutadas después de retirar del bundle los borradores futuros:**

- `npm run typecheck`: pasó.
- `npm test`: 65 pruebas pasaron; todos los puzzles públicos registrados tienen al menos una solución verificada en el catálogo.
- `npm run test:e2e`: 9 pruebas Playwright pasaron, incluyendo archivo, fechas futuras bloqueadas, idioma y referencia del puzzle.
- `npm run build`: completó correctamente (TypeScript y Vite). Vite advierte que el bundle principal pesa aproximadamente 748 kB minificado; es una advertencia de tamaño, no un fallo.
- `git diff --check`: pasó.

En particular, React Flow tuvo antes un fallo de doble manejo de clic que seleccionaba y deseleccionaba una ficha de inmediato. Mantener las pruebas de interacción del navegador.

## Dirección recomendada

El siguiente trabajo debe revisar y mejorar el piloto diario antes de ampliar el producto:

1. Ejecutar las pruebas y solver sobre los doce días; revisar manualmente todos los conteos aceptados.
2. Revisar el contenido matemático y la dificultad con estudiantes de primeros semestres; en particular, evaluar el teorema espectral para decidir si pertenece al piloto.
3. Verificar selección de días, archivo, fechas futuras sin contenido público, selector de práctica e idioma en navegador.
4. Mantener un calendario editorial con explicaciones y fuentes, y reemplazar el calendario fijo antes de una publicación real.
5. En cada fecha de lanzamiento, revisar y mover el borrador local al registro/catálogo público siguiendo `DAILY_PUZZLE_EDITORIAL.md`.

No añadir hiperaristas o premisas compuestas hasta que se acuerde una ampliación formal del modelo. Por ejemplo, algunas implicaciones necesitan conjuntamente `P` y `Q` como premisas, algo que el modelo actual de arista binaria no expresa. Consultar `DAILY_PUZZLE_EDITORIAL.md` para fechas, temas, fuentes y reglas del lote diario.

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
