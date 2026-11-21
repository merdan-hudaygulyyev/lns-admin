"use client";

import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { imageSrc } from "../../utils/format";

interface ImageDropzoneProps {
  file?: File | null;
  currentPath?: string;
  error?: string;
  onFile: (file: File | null) => void;
}

export function ImageDropzone({ file, currentPath, error, onFile }: ImageDropzoneProps) {
  const t = useTranslations("memberForm.image");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const src = preview ?? (currentPath ? imageSrc(currentPath) : null);

  return (
    <div>
      <label className="label">{t("title")}</label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) onFile(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? "border-brand bg-brand/10" : "border-line bg-surface-2/40 hover:border-brand/60"
        } ${error ? "!border-danger" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/*,.heic,.heif,.avif,.tiff"
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />

        {src ? (
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={t("preview")} className="h-28 w-28 rounded-xl object-cover ring-1 ring-line" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">{file?.name ?? t("preview")}</p>
              <p className="text-xs text-muted">{t("hint")}</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t("remove")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">{t("dropHere")}</p>
            <p className="mt-1 max-w-md text-xs text-muted">{t("hint")}</p>
            <span className="btn-secondary mt-3 !py-1.5 text-xs">
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              {t("browse")}
            </span>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
