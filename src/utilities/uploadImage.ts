export const readFile = window.electronAPI.readFile;
export const getBase64ImageURL = (
  fileBuffer: Buffer,
  extension: string
): string => {
  const mimeType = `image/${extension}`;
  const base64String = fileBuffer.toString("base64");
  const imageString = `data:${mimeType};base64,${base64String}`;

  return imageString;
};
