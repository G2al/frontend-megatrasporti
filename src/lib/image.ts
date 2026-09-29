export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.8;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function prepareUpload(file: File): Promise<File> {
  const prepared = file.type.startsWith("image/") ? await compressImage(file) : file;
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error("Il file supera il limite di 16 MB. Scegline uno più leggero.");
  }
  return prepared;
}
