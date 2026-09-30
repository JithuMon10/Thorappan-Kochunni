/**
 * Copies an image from a URL directly to the user's system clipboard as a PNG image.
 * Uses canvas conversion because Clipboard API only reliably supports "image/png".
 */
export async function copyImageToClipboard(imageUrl: string): Promise<void> {
  let blob: Blob | null = null;

  // 1. Attempt direct fetch first
  try {
    const res = await fetch(imageUrl, { mode: "cors" });
    if (!res.ok) throw new Error(`Direct fetch status: ${res.status}`);
    blob = await res.blob();
  } catch {
    // 2. If CORS or network issue, fallback to authenticated server proxy
    const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
    if (!proxyRes.ok) {
      throw new Error("Unable to fetch image data for clipboard");
    }
    blob = await proxyRes.blob();
  }

  // 3. Render image to an offscreen canvas to convert to standard image/png Blob
  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const objectUrl = URL.createObjectURL(blob!);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Canvas context could not be created"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);

        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error("Canvas failed to encode PNG blob"));
          }
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for clipboard conversion"));
    };

    img.src = objectUrl;
  });

  // 4. Write to Clipboard using Clipboard API
  if (!navigator.clipboard || typeof navigator.clipboard.write !== "function" || !window.ClipboardItem) {
    throw new Error("Clipboard image copying is not supported on this browser.");
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": pngBlob,
    }),
  ]);
}
