# Agile Mind

> **Everyday Mental Agility Games**

Plataforma web de juegos breves para entrenar memoria de trabajo, lógica, atención y resolución de problemas. Cada partida se genera en el navegador, se mide por tiempo y guarda sus mejores resultados localmente.

## Experiencia

1. El menú presenta los juegos disponibles y el mejor tiempo registrado para cada uno.
2. El jugador configura la partida cuando corresponde y comienza el cronómetro con la primera interacción.
3. Al completar el desafío aparece un modal de victoria con el tiempo, estadísticas y ranking local.
4. El mejor resultado puede convertirse en imagen WebP, copiarse como imagen PNG o compartirse como texto.
5. El botón **Volver** regresa al menú y **Reiniciar** genera una partida nueva.

## Juegos

| Juego | Objetivo | Opciones y métricas |
| --- | --- | --- |
| **Number Connect** | Conectar los números en orden y recorrer las 36 celdas sin repetirlas. | Tablero 6×6, entre 10 y 18 números, tiempo y cantidad de celdas. |
| **Word Search** | Encontrar todas las palabras ocultas en líneas horizontales, verticales o diagonales. | De 2 a 8 palabras, entre 2 y 20 letras, cuadrícula adaptable y tiempo. |
| **Mini Sudoku** | Completar cada fila, columna y región sin repetir números. | Tableros 4×4 o 9×9, cantidad de pistas, ayudas con penalización de 10 s y tiempo. |
| **Euler Pattern** | Recorrer todas las líneas de un grafo exactamente una vez. | 5–10 nodos, densidad baja/media/alta, modo clásico o desafío, pistas, errores y deshacer. |

### Accesibilidad y controles

- Las cuadrículas y nodos tienen roles y etiquetas para lectores de pantalla.
- Word Search y Number Connect admiten interacción con puntero; Word Search y Sudoku también permiten navegación con teclado.
- Euler Pattern permite `Tab`, flechas, `Enter` y `Espacio`.
- Los mensajes de estado y los modales comunican el progreso y devuelven el foco al comenzar.
- La interfaz es responsive y mantiene el contraste, el foco visible y controles grandes en pantallas táctiles.

## Resultados y persistencia

- Cada juego tiene su propio ranking ordenado por menor tiempo.
- Los resultados incluyen métricas específicas, identificador y fecha de la partida.
- Zustand persiste los rankings en `localStorage`; no existe backend, cuenta de usuario ni sincronización entre dispositivos.
- Desde el menú se puede abrir el mejor resultado de cada juego y compartirlo con una tarjeta visual de **Agile Mind**.
- La exportación usa `html-to-image`; las funciones de portapapeles dependen del soporte y permisos del navegador.

## Arquitectura

```text
src/
├── App.tsx                 # Enrutamiento de la vista actual
├── app/
│   ├── GameMenu.tsx        # Inicio, tarjetas y mejores resultados
│   ├── GameShell.tsx       # Cabecera, reinicio y contenedor común
│   └── gameRegistry.ts     # Carga diferida de los juegos
├── games/                  # Lógica y UI de cada juego
├── components/
│   ├── game/               # Tarjetas del menú
│   ├── sharing/            # Diálogos y exportación de resultados
│   └── ui/                 # Botones, cabecera y modal de victoria
├── store/                  # Rankings persistidos con Zustand
├── hooks/                  # Temporizadores y comportamiento compartido
├── types/                  # Tipos de vistas y props comunes
└── utils/                  # Utilidades de presentación
```

Los juegos se cargan con `React.lazy` y `Suspense`, por lo que el menú no necesita cargar toda la lógica de juego inicialmente. `GameShell` centraliza la navegación, el título, el reinicio y el layout; cada juego conserva su estado y registra el resultado al ganar.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Zustand 5
- Lucide React
- html-to-image

## Desarrollo local

Requiere Node.js y npm.

```bash
npm install
npm run start
```

Comandos disponibles:

```bash
npm run build    # Type-check y build de producción
npm run lint     # ESLint
npm run preview  # Sirve el build local
```

La aplicación se sirve por defecto en `http://localhost:5173`.

## Alcance actual

Agile Mind es una experiencia client-side autocontenida: los niveles, temporizadores, validaciones, rankings y exportaciones se ejecutan localmente. Los datos del ranking se pierden si se limpia el almacenamiento del navegador.
