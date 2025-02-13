import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getLocale: () => ipcRenderer.invoke("get-locale"),
  selectImage: () => ipcRenderer.invoke("select-image"),
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
  generateKeyPair: () => ipcRenderer.invoke("generate-key-pair"),
  getMainServerURL: () => process.env.MAIN_SERVER_URL,
  getVideoServerURL: () => process.env.WS_VIDEO_SERVER_URL,
  getMainChatServerURL: () => process.env.WS_MAIN_CHAT_SERVER_URL,
  getChatUploadsServerURL: () => process.env.CHAT_UPLOADS_SERVER_URL,
  getChatServerURL: () => process.env.WS_CHAT_SERVER_URL,
  getChatHttpServerURL: () => process.env.HTTP_CHAT_SERVER_URL,
  getSalt: () => process.env.SALT,
  getCwd: () => process.cwd(),
  connectChatWebSocket: (studentId: string) =>
    ipcRenderer.send("login", studentId),
  sendMessage: (message: {
    from: string;
    fromID: string;
    to: string;
    toID: string;
    content: string;
    time: number;
  }) => {
    console.log("Sending message...");
    ipcRenderer.send("send-message", message);
  },
  onNewMessage: (callback: (message: any) => void) =>
    ipcRenderer.on("new-message", (_, message) => callback(message)),
  selectChatAttachment: () => ipcRenderer.invoke("select-chat-attachment"),
  getMediaSources: () => ipcRenderer.invoke("get-media-sources"),
  getStripePublishableKey: () => process.env.STRIPE_PUBLISHABLE_KEY,
  getPaymentServerURL: () => process.env.PAYMENT_SERVER_URL,
  getOpenAiApiKey: () => process.env.OPENAI_API_KEY,
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});
