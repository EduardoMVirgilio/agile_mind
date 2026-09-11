import { useCallback, useEffect, useId, useState } from "react";
import { Lightbulb, Play, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VictoryModal } from "../components/ui/VictoryModal";
import { useEulerPatternRanking } from "../store/eulerPatternStore";
import type { GameProps } from "../types/game";
import { cx } from "../utils/classNames";

type GameMode = "classic" | "challenge";
type Density = "low" | "medium" | "high";
type EulerLevel = {
  name: string;
  difficulty: string;
  nodes: { x: number; y: number }[];
  edges: [number, number][];
};
type HistoryEntry = { path: number[]; visitedEdges: string[] };

const DENSITY_LABELS: Record<Density, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};
const DENSITY_CYCLES: Record<Density, number> = { low: 0, medium: 1, high: 2 };

const edgeId = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

const generateEulerLevel = (
  nodeCount: number,
  density: Density,
): EulerLevel => {
  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / nodeCount - Math.PI / 2;
    return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 40 };
  });
  const edges: [number, number][] = [];
  const existing = new Set<string>();
  const addEdge = (a: number, b: number) => {
    const id = edgeId(a, b);
    if (a !== b && !existing.has(id)) {
      existing.add(id);
      edges.push([a, b]);
    }
  };

  // A cycle is connected and gives every node an even degree.
  for (let index = 0; index < nodeCount; index++)
    addEdge(index, (index + 1) % nodeCount);

  // Adding complete triangles keeps every degree even and preserves solvability.
  const available = Array.from({ length: nodeCount }, (_, index) => index);
  for (let cycle = 0; cycle < DENSITY_CYCLES[density]; cycle++) {
    const start = Math.floor(Math.random() * nodeCount);
    const a = available[start];
    const b = available[(start + 2 + cycle) % nodeCount];
    const c = available[(start + 4 + cycle * 2) % nodeCount];
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  const difficulty =
    nodeCount <= 6 && density === "low"
      ? "Fácil"
      : nodeCount >= 9 || density === "high"
        ? "Difícil"
        : "Media";
  return { name: "Grafo aleatorio", difficulty, nodes, edges };
};

export const EulerPattern = ({ onMenu }: GameProps) => {
  const titleId = useId();
  const [isConfigured, setIsConfigured] = useState(false);
  const [nodeCount, setNodeCount] = useState(7);
  const [density, setDensity] = useState<Density>("medium");
  const [mode, setMode] = useState<GameMode>("classic");
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [availableEdgesVisible, setAvailableEdgesVisible] = useState(true);
  const [level, setLevel] = useState<EulerLevel>(() =>
    generateEulerLevel(7, "medium"),
  );
  const [path, setPath] = useState<number[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errors, setErrors] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [hintNode, setHintNode] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedNode, setFocusedNode] = useState(0);
  const addGame = useEulerPatternRanking((state) => state.addGame);
  const ranking = useEulerPatternRanking((state) => state.games);

  const resetLevel = useCallback(() => {
    setPath([]);
    setVisitedEdges([]);
    setHistory([]);
    setIsWon(false);
    setElapsedTime(0);
    setErrors(0);
    setHintsUsed(0);
    setFeedback("Selecciona un nodo para comenzar.");
    setStartedAt(null);
    setPenaltyMs(0);
    setHintNode(null);
    setIsDragging(false);
    setFocusedNode(0);
  }, []);

  const startGame = () => {
    setLevel(generateEulerLevel(nodeCount, density));
    setIsConfigured(true);
    resetLevel();
  };

  useEffect(() => {
    if (startedAt === null || isWon) return;
    const timer = window.setInterval(
      () => setElapsedTime(Date.now() - startedAt + penaltyMs),
      100,
    );
    return () => window.clearInterval(timer);
  }, [startedAt, isWon, penaltyMs]);

  const selectNode = (nodeIdx: number) => {
    if (isWon) return;
    if (startedAt === null) setStartedAt(Date.now());
    setHintNode(null);
    if (path.length === 0) {
      setPath([nodeIdx]);
      setFeedback(`Nodo ${nodeIdx + 1} seleccionado. Elige un nodo conectado.`);
      return;
    }

    const lastNode = path[path.length - 1];
    const connection = level.edges.find(
      ([from, to]) =>
        (from === lastNode && to === nodeIdx) ||
        (to === lastNode && from === nodeIdx),
    );
    const currentEdge = edgeId(lastNode, nodeIdx);
    if (!connection || visitedEdges.includes(currentEdge)) {
      setErrors((value) => value + 1);
      const reason = !connection
        ? "Los nodos no están conectados."
        : "Esa línea ya fue recorrida.";
      if (mode === "challenge") {
        setPath([]);
        setVisitedEdges([]);
        setHistory([]);
        setFeedback(`Desafío: ${reason} El recorrido se reinició.`);
      } else {
        setFeedback(`Movimiento inválido: ${reason}`);
      }
      return;
    }

    setHistory((entries) => [...entries, { path, visitedEdges }]);
    const nextPath = [...path, nodeIdx];
    const nextEdges = [...visitedEdges, currentEdge];
    setPath(nextPath);
    setVisitedEdges(nextEdges);
    setFeedback(
      `${nextEdges.length} de ${level.edges.length} líneas recorridas.`,
    );
    if (nextEdges.length === level.edges.length) {
      const finalTime = Date.now() - (startedAt ?? Date.now()) + penaltyMs;
      setElapsedTime(finalTime);
      setIsWon(true);
      addGame({ timeMs: finalTime, level: nodeCount, errors });
    }
  };

  const moveFocus = (offset: number) => {
    const next =
      (focusedNode + offset + level.nodes.length) % level.nodes.length;
    setFocusedNode(next);
    document.getElementById(`${titleId}-node-${next}`)?.focus();
  };

  const requestHint = () => {
    if (!hintsEnabled || isWon) return;
    const currentNode = path.at(-1);
    const candidates =
      currentNode === undefined
        ? level.nodes.map((_, index) => index)
        : level.edges
            .filter(
              ([from, to]) =>
                (from === currentNode || to === currentNode) &&
                !visitedEdges.includes(edgeId(from, to)),
            )
            .map(([from, to]) => (from === currentNode ? to : from));
    const nextNode = candidates[0];
    if (nextNode === undefined) return;
    if (startedAt === null) setStartedAt(Date.now());
    setPenaltyMs((value) => value + 10000);
    setElapsedTime((value) => value + 10000);
    setHintsUsed((value) => value + 1);
    setHintNode(nextNode);
    setFeedback(
      `Pista: prueba el nodo ${nextNode + 1}. Se añadieron 10 segundos.`,
    );
  };

  const undoMove = () => {
    if (isWon || history.length === 0) return;
    const previous = history[history.length - 1];
    setPath(previous.path);
    setVisitedEdges(previous.visitedEdges);
    setHistory((entries) => entries.slice(0, -1));
    setFeedback("Último movimiento deshecho.");
  };

  const formattedTime = `${(elapsedTime / 1000).toFixed(1)} s`;
  const formatPlayedAt = (playedAt: string) =>
    new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(playedAt));

  if (!isConfigured) {
    return (
      <main
        className="mx-auto w-full max-w-2xl p-4 sm:p-8"
        aria-labelledby={`${titleId}-setup`}
      >
        <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-xl sm:p-8">
          <h1
            id={`${titleId}-setup`}
            className="text-2xl font-black text-white"
          >
            Configura Euler Pattern
          </h1>
          <p className="mt-2 text-slate-300">
            Cada partida genera un grafo conectado con recorrido Euleriano
            válido.
          </p>
          <fieldset className="mt-6">
            <legend className="mb-3 font-bold text-slate-100">
              Número de nodos: {nodeCount}
            </legend>
            <input
              aria-label={`Número de nodos: ${nodeCount}`}
              type="range"
              min="5"
              max="10"
              value={nodeCount}
              onChange={(event) => setNodeCount(Number(event.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="mt-1 flex justify-between text-sm text-slate-400">
              <span>5 (fácil)</span>
              <span>10 (difícil)</span>
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="mb-3 font-bold text-slate-100">
              Densidad de líneas
            </legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DENSITY_LABELS) as Density[]).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={density === option ? "primary" : "outline"}
                  aria-pressed={density === option}
                  onClick={() => setDensity(option)}
                >
                  {DENSITY_LABELS[option]}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="mb-3 font-bold text-slate-100">
              Modo de juego
            </legend>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "classic" ? "primary" : "outline"}
                aria-pressed={mode === "classic"}
                onClick={() => setMode("classic")}
              >
                Clásico
              </Button>
              <Button
                type="button"
                variant={mode === "challenge" ? "primary" : "outline"}
                aria-pressed={mode === "challenge"}
                onClick={() => setMode("challenge")}
              >
                Desafío
              </Button>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {mode === "challenge"
                ? "Un movimiento inválido reinicia el recorrido."
                : "Puedes equivocarte y deshacer movimientos."}
            </p>
          </fieldset>
          <fieldset className="mt-6 space-y-3">
            <legend className="font-bold text-slate-100">
              Ayudas y visualización
            </legend>
            <label className="flex items-center gap-3 text-slate-300">
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={(event) => setHintsEnabled(event.target.checked)}
                className="size-5 accent-indigo-500"
              />
              Permitir pistas (penalización de 10 segundos)
            </label>
            <label className="flex items-center gap-3 text-slate-300">
              <input
                type="checkbox"
                checked={availableEdgesVisible}
                onChange={(event) =>
                  setAvailableEdgesVisible(event.target.checked)
                }
                className="size-5 accent-indigo-500"
              />
              Resaltar líneas disponibles
            </label>
          </fieldset>
          <Button onClick={startGame} className="mt-8 w-full sm:w-auto">
            <Play size={18} /> Generar partida
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col items-center p-4"
      aria-labelledby={`${titleId}-game`}
    >
      <div className="mb-5 flex w-full flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id={`${titleId}-game`} className="text-2xl font-black text-white">
            Euler Pattern
          </h1>
          <p className="text-sm text-slate-300">
            {level.name} · {level.difficulty} · {nodeCount} nodos
          </p>
        </div>
        <div
          className="text-right text-sm text-slate-300"
          aria-label={`Tiempo ${formattedTime}, ${visitedEdges.length} de ${level.edges.length} líneas, ${errors} errores`}
        >
          <p>
            Tiempo: <strong className="text-white">{formattedTime}</strong>
          </p>
          <p>
            Líneas:{" "}
            <strong className="text-emerald-400">
              {visitedEdges.length}/{level.edges.length}
            </strong>{" "}
            · Errores: <strong className="text-rose-300">{errors}</strong>
          </p>
        </div>
      </div>
      <p className="mb-4 max-w-lg text-center text-slate-400">
        Selecciona un nodo y después otro conectado. Con teclado: Tab para
        enfocar, flechas para mover el foco y Enter o Espacio para seleccionar.
      </p>
      <p
        className="mb-4 min-h-6 text-center text-sm text-amber-300"
        aria-live="polite"
        role="status"
      >
        {feedback}
      </p>
      <p id={`${titleId}-instructions`} className="sr-only">
        Cada nodo es un control interactivo. Las flechas cambian el nodo
        enfocado y Enter o Espacio lo seleccionan. Las líneas verdes ya fueron
        recorridas y las amarillas están disponibles.
      </p>
      <div className="relative aspect-square w-full max-w-[420px] rounded-3xl border-2 border-slate-700 bg-slate-800 p-4 shadow-2xl">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full touch-none select-none drop-shadow-lg"
          role="group"
          aria-labelledby={`${titleId}-game`}
          aria-describedby={`${titleId}-instructions`}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
        >
          {level.edges.map(([from, to]) => {
            const current = edgeId(from, to);
            const isVisited = visitedEdges.includes(current);
            const isAvailable =
              availableEdgesVisible &&
              path.at(-1) !== undefined &&
              (from === path.at(-1) || to === path.at(-1)) &&
              !isVisited;
            return (
              <line
                key={current}
                x1={level.nodes[from].x}
                y1={level.nodes[from].y}
                x2={level.nodes[to].x}
                y2={level.nodes[to].y}
                stroke={
                  isVisited ? "#34d399" : isAvailable ? "#fbbf24" : "#475569"
                }
                strokeWidth={isVisited ? 3 : isAvailable ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeDasharray={isAvailable ? "2 2" : undefined}
              />
            );
          })}
          {path.length > 0 && (
            <polyline
              points={path
                .map((node) => `${level.nodes[node].x},${level.nodes[node].y}`)
                .join(" ")}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="pointer-events-none opacity-50"
            />
          )}
          {level.nodes.map((node, index) => {
            const isCurrent = path.at(-1) === index;
            const isStart = path[0] === index;
            const isHint = hintNode === index;
            return (
              <circle
                key={index}
                id={`${titleId}-node-${index}`}
                cx={node.x}
                cy={node.y}
                r={isCurrent ? 6 : 4}
                fill={isCurrent ? "#6366f1" : isStart ? "#f43f5e" : "#e2e8f0"}
                stroke={isHint ? "#fbbf24" : "#0f172a"}
                strokeWidth={isHint ? 3 : 2}
                className={cx(
                  "cursor-pointer transition-all hover:r-[7px] focus-visible:stroke-white focus-visible:stroke-[3px]",
                  isHint && "animate-pulse",
                )}
                role="button"
                tabIndex={focusedNode === index ? 0 : -1}
                aria-label={`Nodo ${index + 1}${isCurrent ? ", actual" : ""}${isStart ? ", inicio" : ""}${isHint ? ", pista recomendada" : ""}`}
                onFocus={() => setFocusedNode(index)}
                onPointerDown={() => {
                  setIsDragging(true);
                  selectNode(index);
                }}
                onPointerEnter={() => {
                  if (isDragging) selectNode(index);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    moveFocus(1);
                  } else if (
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowUp"
                  ) {
                    event.preventDefault();
                    moveFocus(-1);
                  } else if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectNode(index);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button
          variant="secondary"
          onClick={requestHint}
          disabled={!hintsEnabled || isWon}
        >
          <Lightbulb size={18} /> Pista (+10 s)
        </Button>
        <Button
          variant="outline"
          onClick={undoMove}
          disabled={history.length === 0 || isWon}
        >
          <Undo2 size={18} /> Deshacer
        </Button>
        <Button variant="ghost" onClick={resetLevel}>
          <RotateCcw size={18} /> Reiniciar
        </Button>
        <Button variant="ghost" onClick={() => setIsConfigured(false)}>
          Configuración
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        Modo {mode === "challenge" ? "Desafío" : "Clásico"} · {hintsUsed} pistas
        usadas
      </p>
      <VictoryModal
        show={isWon}
        onRestart={resetLevel}
        onMenu={onMenu ?? (() => {})}
        title="¡Patrón completado!"
        details={
          <div className="rounded-lg bg-slate-800 p-4 text-center">
            <p className="font-bold text-emerald-400">
              Completado en {formattedTime}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {errors} errores · {hintsUsed} pistas
            </p>
            <div className="mt-5 text-left">
              <p className="mb-2 text-sm font-bold text-slate-100">
                Mejores tiempos
              </p>
              {ranking.slice(0, 10).map((game, index) => (
                <div
                  key={game.id}
                  className={cx(
                    "mb-2 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-lg border p-3",
                    index === 0
                      ? "border-amber-300/70 bg-amber-300/15"
                      : "border-slate-600 bg-slate-950/80",
                  )}
                >
                  <span className="text-sm font-semibold text-slate-100">
                    #{index + 1} · {game.level} nodos
                  </span>
                  <span className="text-right text-base font-black text-emerald-300">
                    {(game.timeMs / 1000).toFixed(1)} s
                  </span>
                  <span className="col-span-2 text-xs text-slate-300">
                    Jugado: {formatPlayedAt(game.playedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      />
    </main>
  );
};
