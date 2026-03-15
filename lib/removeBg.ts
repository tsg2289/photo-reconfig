const REMOVEBG_API_URL = "https://api.remove.bg/v1.0/removebg";

export async function removeBackground(
  imageBuffer: Buffer,
  apiKey: string
): Promise<Buffer> {
  const formData = new FormData();
  formData.append("image_file", new Blob([new Uint8Array(imageBuffer)]), "image.jpg");
  formData.append("size", "auto");
  formData.append("bg_color", "ffffff");
  formData.append("format", "jpg");

  const response = await fetch(REMOVEBG_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`remove.bg API error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
