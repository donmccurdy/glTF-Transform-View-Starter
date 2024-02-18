export function downloadBytes(bytes: Uint8Array, name: string): void {
  const blob = new Blob([bytes], { type: "model/gltf-binary" });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}
