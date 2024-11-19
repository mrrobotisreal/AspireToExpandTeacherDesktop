import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getLocale: () => ipcRenderer.invoke("get-locale"),
  selectImage: () => ipcRenderer.invoke("select-image"),
  getMainServerURL: () => process.env.MAIN_SERVER_URL,
  getVideoServerURL: () => process.env.VIDEO_SERVER_URL,
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
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});
