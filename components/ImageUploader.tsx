"use client";

import { useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { GlassCard } from "./GlassCard";

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function ImageUploader({ files, onFilesChange }: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageFiles = acceptedFiles.filter((f) =>
        f.type.startsWith("image/")
      );
      onFilesChange([...files, ...imageFiles]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: true,
  });

  const thumbUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );
  useEffect(
    () => () => thumbUrls.forEach((u) => URL.revokeObjectURL(u)),
    [thumbUrls]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    [next[from], next[to]] = [next[to], next[from]];
    onFilesChange(next);
  };

  return (
    <GlassCard className="p-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-400/10"
            : "border-white/30 hover:border-white/50 hover:bg-white/5"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium text-foreground/90">
          {isDragActive ? "Drop images here" : "Drop images here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-foreground/60">
          JPEG, PNG, WebP. First image = main product shot.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground/80">
            {files.length} image{files.length !== 1 ? "s" : ""} selected
          </p>
          <div className="space-y-3">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="group relative flex flex-wrap items-center gap-3 rounded-lg bg-white/10 px-3 py-3"
              >
                <Image
                  src={thumbUrls[i]}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 rounded object-cover"
                />
                <span className="min-w-0 max-w-[140px] truncate text-sm text-foreground/90">
                  {file.name}
                </span>
                {i === 0 && (
                  <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-xs text-blue-200">
                    Main
                  </span>
                )}
                <div className="flex gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveFile(i, i - 1)}
                      className="rounded p-1 text-foreground/60 hover:bg-white/20 hover:text-foreground"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {i < files.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveFile(i, i + 1)}
                      className="rounded p-1 text-foreground/60 hover:bg-white/20 hover:text-foreground"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="rounded p-1 text-red-400 hover:bg-red-500/20"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground/60">
            People and lifestyle shots are detected automatically during
            processing.
          </p>
        </div>
      )}
    </GlassCard>
  );
}
