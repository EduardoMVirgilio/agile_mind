import { useRef, useState } from "react";
import { Brain, Download, Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { Button } from "../ui/Button";

export type ShareResultData = {
  title: string;
  timeMs: number;
  stats: Array<{ label: string; value: string | number; emoji?: string }>;
};

type ShareResultProps = {
  result: ShareResultData;
  fileName?: string;
};

const platformUrl = () => window.location.origin;
const SHARE_FORMAT = "image/webp";
const CLIPBOARD_FORMAT = "image/png";
const SHARE_SIZE = 540;

type ResultCardProps = {
  result: ShareResultProps["result"];
  formattedTime: string;
  exportMode?: boolean;
};

const ResultCard = ({
  result,
  formattedTime,
  exportMode = false,
}: ResultCardProps) => {
  const formatLabel = (label: string) => label.replace(/:\s*$/, "");

  return (
    <div
      className={
        exportMode
          ? "relative flex h-[540px] w-[540px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-full p-8 text-center text-white"
          : "relative flex aspect-square w-full max-w-[540px] flex-col items-center justify-center p-4 text-center text-white sm:p-8"
      }
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-900 p-4 text-center text-white shadow-lg ring-1 ring-slate-700/80 sm:gap-4 sm:p-8">
        <div
          className={
            exportMode
              ? "flex w-full flex-col items-center justify-center"
              : "flex w-[122%] scale-[0.82] flex-col items-center justify-center sm:w-full sm:scale-100"
          }
        >
          <div
            className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl ring-2 ring-indigo-500/50 sm:mb-6 sm:h-20 sm:w-20"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.16)" }}
          >
            <Brain
              size={38}
              className="text-indigo-400 sm:h-[52px] sm:w-[52px]"
            />
          </div>
          <p className="w-full text-center text-2xl font-black text-indigo-200 sm:text-3xl">
            {result.title}
          </p>
          <p className="mt-2 w-full text-center text-5xl font-black text-emerald-400 sm:mt-5 sm:text-7xl">
            {formattedTime}
          </p>
          <div className="mt-3 flex w-full flex-col items-center gap-2 text-sm text-slate-200 sm:mt-6 sm:gap-3 sm:text-xl">
            {result.stats.map(({ label, value, emoji = "•" }) => (
              <div
                key={label}
                className="flex w-full items-center justify-center gap-3 text-center"
              >
                <span
                  className="w-7 shrink-0 text-lg leading-none sm:w-9 sm:text-2xl"
                  aria-hidden="true"
                >
                  {emoji}
                </span>
                <p className="text-center">
                  <span className="text-slate-300">{formatLabel(label)}:</span>{" "}
                  <strong className="font-semibold text-white">{value}</strong>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center sm:mt-8">
            <p className="text-base font-bold text-slate-300 sm:text-lg">
              Agile Mind
            </p>
            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-base">
              Everyday Mental Agility Games
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShareResult = ({
  result,
  fileName = "agile-mind-result.webp",
}: ShareResultProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const formattedTime = `${(result.timeMs / 1000).toFixed(1)} s`;
  const formatLabel = (label: string) => label.replace(/:\s*$/, "");
  const shareText = [
    `🧠 ${result.title}`,
    `⏱️ ${formattedTime}`,
    ...result.stats.map(
      ({ label, value, emoji = "•" }) =>
        `${emoji} ${formatLabel(label)}: ${value}`,
    ),
    "",
    `Juega en ${platformUrl()}`,
  ].join("\n");

  const createImage = async (type: string) => {
    if (!cardRef.current)
      throw new Error("La tarjeta de resultado no está disponible.");
    return toBlob(cardRef.current, {
      backgroundColor: "transparent",
      cacheBust: true,
      height: SHARE_SIZE,
      width: SHARE_SIZE,
      pixelRatio: 2,
      style: {
        height: `${SHARE_SIZE}px`,
        maxWidth: "none",
        width: `${SHARE_SIZE}px`,
      },
      type,
      quality: 0.95,
      filter: (node) => {
        if (node instanceof HTMLButtonElement) return false;
        return true;
      },
    });
  };

  const downloadImage = async () => {
    try {
      const blob = await createImage(SHARE_FORMAT);
      if (!blob) throw new Error("No se pudo generar la imagen.");
      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName.replace(/\.png$/i, ".webp");
      link.href = imageUrl;
      link.click();
      URL.revokeObjectURL(imageUrl);
      setStatus("Imagen descargada");
    } catch {
      setStatus("No se pudo descargar la imagen");
    }
  };

  const copyImage = async () => {
    try {
      const blob = await createImage(CLIPBOARD_FORMAT);
      if (
        !blob ||
        !navigator.clipboard ||
        typeof ClipboardItem === "undefined"
      ) {
        throw new Error("El navegador no permite copiar imágenes.");
      }
      await navigator.clipboard.write([
        new ClipboardItem({ [CLIPBOARD_FORMAT]: blob }),
      ]);
      setStatus("Imagen copiada al portapapeles");
    } catch {
      setStatus("No se pudo copiar la imagen");
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("Texto copiado");
    } catch {
      setStatus("No se pudo copiar el texto");
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <ResultCard result={result} formattedTime={formattedTime} />
      <div className="pointer-events-none absolute -left-[10000px] top-0">
        <div ref={cardRef}>
          <ResultCard
            result={result}
            formattedTime={formattedTime}
            exportMode
          />
        </div>
      </div>
      <div className="mt-4 grid w-full max-w-[540px] grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          variant="secondary"
          onClick={downloadImage}
          className="text-sm whitespace-normal text-center"
        >
          <Download size={16} /> Descargar imagen
        </Button>
        <Button
          variant="outline"
          onClick={copyImage}
          className="text-sm whitespace-normal text-center"
        >
          Copiar imagen
        </Button>
        <Button
          variant="ghost"
          onClick={copyText}
          className="text-sm whitespace-normal text-center"
        >
          <Share2 size={16} /> Copiar texto
        </Button>
      </div>
      {status && (
        <p className="mt-3 text-center text-xs text-slate-400">{status}</p>
      )}
    </div>
  );
};
