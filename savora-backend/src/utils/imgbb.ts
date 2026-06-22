export async function uploadToImgBB(buffer: Buffer, originalname: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("IMGBB_API_KEY is not defined in the environment variables");
  }

  const formData = new FormData();
  // ImgBB API expects base64 encoded string or file object. Since we are using native fetch and FormData from node,
  // we can pass a Blob, but in Node 18+ FormData, passing a Blob is preferred.
  // Alternatively, we can pass a base64 encoded string which is fully supported by ImgBB.
  formData.append("key", apiKey);
  formData.append("image", buffer.toString("base64"));
  formData.append("name", originalname);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ImgBB API Error:", errorText);
    throw new Error(`ImgBB upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result && result.data && result.data.url) {
    return result.data.url;
  }

  throw new Error("Invalid response format from ImgBB API");
}
