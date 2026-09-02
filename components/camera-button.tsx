"use client";

import { useRef, useState } from "react";

export function CameraButton({
  onFile,
  label = "Prendre une photo du devoir",
}: {
  onFile: (file: File) => Promise<void> | void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCamera() {
    setError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(media);
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
      });
    } catch {
      inputRef.current?.click();
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setLive(false);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await onFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function snap() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.86),
    );
    stopCamera();
    if (blob) {
      await handleFile(new File([blob], "devoir.jpg", { type: "image/jpeg" }));
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
      {!live ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void startCamera()}
            className="rounded-2xl bg-sky px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Envoi…" : label}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl border border-line bg-card px-4 py-3 text-sm font-semibold"
          >
            Choisir une image
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-black">
          <video ref={videoRef} autoPlay playsInline className="max-h-80 w-full object-cover" />
          <div className="flex gap-2 p-3">
            <button
              type="button"
              onClick={() => void snap()}
              className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              Capturer
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-2xl bg-white/20 px-4 py-3 text-sm font-semibold text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
