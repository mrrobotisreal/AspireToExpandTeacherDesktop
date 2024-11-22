import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import WebSocket from "ws";
import { generateKeyPairSync } from "crypto";
import "dotenv/config";

let mainWindow: BrowserWindow | null = null;
let socket: WebSocket | null = null;

function connectChatWebSocket(studentId: string) {
  socket = new WebSocket(
    `${process.env.WS_CHAT_SERVER_URL}/chat?studentID=${studentId}`
  );
  console.log("Attempting Connection...");

  socket.on("open", () => {
    console.log("Successfully Connected to Chat websocket server!");
  });

  socket.on("close", (event) => {
    console.log("Client Closed Connection!");
  });

  socket.on("error", (error) => {
    console.log("Socket Error: ", error);
  });

  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log("Message From Server: ", message);
    mainWindow?.webContents.send("new-message", message);
  });
}

ipcMain.on("send-message", (_, message) => {
  console.log("Sending socket message...");
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("For sure sending socket message...");
    socket.send(JSON.stringify(message));
  }

  if (socket && socket.readyState === WebSocket.CLOSED) {
    console.log("Reconnecting to chat server... Try sending message again...");
    connectChatWebSocket(message.fromID);
  }
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      webSecurity: false,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();
  mainWindow.webContents.openDevTools();

  if (process.env.NODE_ENV === "development") {
    console.log("Loading from Webpack Dev Server at http://localhost:9001/");
    mainWindow.loadURL("http://localhost:9001/");
  } else {
    console.log("Loading from local index.html");
    mainWindow.loadFile(path.join(__dirname, "..", "index.html"));
  }

  ipcMain.handle("get-locale", () => app.getLocale());
  ipcMain.handle("select-image", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    });

    // TODO: figure out why TS shows an error here. Testing clearly shows that the implementation below works as expected and TS clearly has the types wrong.
    // @ts-ignore
    if (result.canceled) {
      return null;
    } else {
      // @ts-ignore
      return result.filePaths[0];
    }
  });
  ipcMain.handle("select-chat-attachment", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
      filters: [
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    // @ts-ignore
    if (result.canceled) {
      return null;
    } else {
      // @ts-ignore
      return result.filePaths[0];
    }
  });
  ipcMain.handle("read-file", async (_, filePath: string) => {
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer;
  });
  ipcMain.handle("generate-key-pair", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    console.log("Key pair successfully created!");
    return { privateKey, publicKey };
  });
}

app.whenReady().then(() => createWindow());

ipcMain.on("login", (_, studentId) => {
  connectChatWebSocket(studentId);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
