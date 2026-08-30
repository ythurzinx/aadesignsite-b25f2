"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { CheckCircle2, Film, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type MuxVideoValue = {
  uploadId: string;
  assetId: string;
  playbackId: string;
  status: "ready";
};

export type MuxUploadValue = { uploadId: string; status: "waiting" };

type ProcessingStatus = "idle" | "uploading" | "processing" | "ready" | "error";

export function MuxVideoUploader({ label = "Enviar vídeo em até 4K", currentUploadId, currentPlaybackId, currentStatus, onCreated, onReady }: {
  label?: string;
  currentUploadId?: string | null;
  currentPlaybackId?: string | null;
  currentStatus?: string | null;
  onCreated?: (value: MuxUploadValue) => void;
  onReady: (value: MuxVideoValue) => void;
}) {
  const uploadId = useRef<string | null>(currentUploadId ?? null);
  const resumed = useRef(false);
  const processingExisting = Boolean(currentUploadId && currentStatus !== "ready");
  const [status, setStatus] = useState<ProcessingStatus>(processingExisting ? "processing" : currentPlaybackId ? "ready" : "idle");
  const [message, setMessage] = useState(processingExisting ? "Retomando consulta do processamento…" : currentPlaybackId ? "Vídeo Mux pronto para exibição." : "");

  const endpoint = useCallback(async () => {
    setStatus("uploading");
    setMessage("Preparando envio seguro…");
    const response = await fetch("/api/mux/uploads", { method: "POST", headers: { "Content-Type": "application/json" } });
    const data = (await response.json()) as { id?: string; url?: string; error?: string };
    if (!response.ok || !data.id || !data.url) {
      setStatus("error");
      setMessage(data.error || "Não foi possível iniciar o envio.");
      throw new Error(data.error || "Falha ao iniciar upload");
    }
    uploadId.current = data.id;
    resumed.current = true;
    onCreated?.({ uploadId: data.id, status: "waiting" });
    setMessage("Enviando em partes; você pode pausar e continuar.");
    return data.url;
  }, [onCreated]);

  const waitUntilReady = useCallback(async () => {
    const id = uploadId.current;
    if (!id) return;
    setStatus("processing");
    setMessage("Upload concluído. O Mux está preparando as versões adaptativas e o áudio…");

    for (let attempt = 0; attempt < 120; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt < 6 ? 3000 : 7000));
      const response = await fetch(`/api/mux/uploads/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = (await response.json()) as { status?: string; assetId?: string; playbackId?: string; error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Falha ao consultar o processamento.");
        return;
      }
      if (["errored", "cancelled", "timed_out"].includes(data.status || "")) {
        setStatus("error");
        setMessage(data.error || "O Mux não conseguiu processar este arquivo.");
        return;
      }
      if (data.status === "ready" && data.assetId && data.playbackId) {
        setStatus("ready");
        setMessage("Vídeo pronto. Salve o formulário para publicar.");
        onReady({ uploadId: id, assetId: data.assetId, playbackId: data.playbackId, status: "ready" });
        return;
      }
    }

    setStatus("error");
    setMessage("O processamento está demorando. Reabra esta tela em alguns minutos para conferir.");
  }, [onReady]);

  useEffect(() => {
    if (currentUploadId && currentStatus !== "ready" && !resumed.current) {
      resumed.current = true;
      uploadId.current = currentUploadId;
      void waitUntilReady();
    }
  }, [currentStatus, currentUploadId, waitUntilReady]);

  return (
    <div className="rounded-2xl border border-[#003b70]/10 bg-[#f7fbfd] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f7fb] text-[#0077b8]"><Film className="h-5 w-5" /></span>
        <div><p className="text-sm font-black text-[#102a43]">{label}</p><p className="text-xs text-[#627d98]">Arquivo pesado, áudio original e envio retomável.</p></div>
      </div>
      <MuxUploader
        endpoint={endpoint}
        pausable
        dynamicChunkSize
        useLargeFileWorkaround
        type="bar"
        onSuccess={() => void waitUntilReady()}
        onUploadError={() => { setStatus("error"); setMessage("O upload falhou. Você pode tentar novamente."); }}
        style={{ "--progress-bar-fill-color": "#0077b8" }}
      />
      {message && <p className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs ${status === "error" ? "bg-red-50 text-red-700" : status === "ready" ? "bg-emerald-50 text-emerald-700" : "bg-[#eaf6fb] text-[#005a9c]"}`} aria-live="polite">{status === "processing" || status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "ready" ? <CheckCircle2 className="h-4 w-4" /> : null}{message}</p>}
    </div>
  );
}
