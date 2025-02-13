export interface ElectronAPI {
  getLocale: () => Promise<string>;
  selectImage: () => Promise<string>;
  readFile: (filePath: string) => Promise<Buffer>;
  generateKeyPair: () => Promise<{ publicKey: string; privateKey: string }>;
  getMainServerURL: () => string;
  getVideoServerURL: () => string;
  getChatServerURL: () => string;
  getMainChatServerURL: () => string;
  getChatUploadsServerURL: () => string;
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
  getMediaSources: () => Promise<Electron.DesktopCapturerSource[]>;
  getStripePublishableKey: () => string;
  getPaymentServerURL: () => string;
  getOpenAiApiKey: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

interface MediaTrackConstraints {
  mandatory?: {
    chromeMediaSource?: string;
    chromeMediaSourceId?: string;
  };
}
