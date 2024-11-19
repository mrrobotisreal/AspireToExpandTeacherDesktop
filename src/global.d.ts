export interface ElectronAPI {
  getLocale: () => Promise<string>;
  selectImage: () => Promise<string>;
  getMainServerURL: () => string;
  getVideoServerURL: () => string;
  getChatServerURL: () => string;
  getChatHttpServerURL: () => string;
  getSalt: () => string;
  getCwd: () => string;
  connectChatWebSocket: (studentId: string) => void;
  sendMessage: (message: {
    from: string;
    fromID: string;
    to: string;
    toID: string;
    content: string;
    time: number;
  }) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  selectChatAttachment: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
