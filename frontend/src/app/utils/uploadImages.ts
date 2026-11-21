import type { Member, UploadImage } from "../types";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createUploadImages(files: File[]): UploadImage[] {
  return files.map((file) => ({
    id: createId(),
    file,
    previewUrl: URL.createObjectURL(file),
  }));
}

export function savedImages(member: Member | undefined): UploadImage[] {
  const paths = member?.imagePaths?.length ? member.imagePaths : member?.imagePath ? [member.imagePath] : [];
  return paths.map((path) => ({ id: createId(), path }));
}

export function revokePreview(image: UploadImage): void {
  if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

export function revokePreviews(images: UploadImage[]): void {
  images.forEach(revokePreview);
}
