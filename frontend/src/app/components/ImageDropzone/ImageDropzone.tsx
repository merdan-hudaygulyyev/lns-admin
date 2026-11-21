"use client";

import { ArrowLeft, ArrowRight, ImagePlus, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { UploadImage } from "../../types";
import { imageSrc } from "../../utils/format";

interface ImageDropzoneProps {
  images: UploadImage[];
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function ImageDropzone({ images, error, onAdd, onRemove, onMove }: ImageDropzoneProps) {
  const t = useTranslations("memberForm.image");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null): void => {
    const selected = Array.from(files ?? []);
    if (selected.length) onAdd(selected);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="label">{t("title")}</label>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? "border-brand bg-brand/10" : "border-line bg-surface-2/40 hover:border-brand/60"
        } ${error ? "!border-danger" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          name="images"
          accept="image/*,.heic,.heif,.avif,.tiff"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
        <UploadCloud className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-ink">{t("dropHere")}</p>
        <p className="mt-1 max-w-md text-xs text-muted">{t("hint")}</p>
        <span className="btn-secondary mt-3 !py-1.5 text-xs">
          <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("browse")}
        </span>
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => {
            const src = image.previewUrl ?? (image.path ? imageSrc(image.path) : null);
            const name = image.file?.name ?? image.path?.split("/").pop() ?? t("preview");

            return (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2"
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center px-2 text-center text-xs text-muted">
                    {name}
                  </span>
                )}

                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                  {index + 1}
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
                  <span className="min-w-0 flex-1 truncate text-xs text-white">{name}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title={t("moveLeft")}
                      aria-label={t("moveLeft")}
                      disabled={index === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        onMove(image.id, -1);
                      }}
                      className="rounded-md bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={t("moveRight")}
                      aria-label={t("moveRight")}
                      disabled={index === images.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        onMove(image.id, 1);
                      }}
                      className="rounded-md bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={t("remove")}
                      aria-label={t("remove")}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(image.id);
                      }}
                      className="rounded-md bg-danger/80 p-1 text-white hover:bg-danger"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
