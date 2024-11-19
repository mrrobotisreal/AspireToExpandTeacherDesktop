import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import WebSocket from "ws";
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
  // TODO: see if I need the code below still after deploying server
  // mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
  //   (details, callback) => {
  //     callback({ requestHeaders: { Origin: "*", ...details.requestHeaders } });
  //   }
  // );
  // mainWindow.webContents.session.webRequest.onHeadersReceived(
  //   (details, callback) => {
  //     callback({
  //       responseHeaders: {
  //         "Access-Control-Allow-Origin": "*",
  //         "Access-Control-Allow-Headers": "*",
  //         ...details.responseHeaders,
  //       },
  //     });
  //   }
  // );

  mainWindow.loadFile("index.html");
  if (process.env.NODE_ENV === "development") {
    console.log("Loading from Webpack Dev Server at http://localhost:9000");
    mainWindow.loadURL("http://localhost:9000");
  } else {
    console.log("Loading from local index.html");
    // mainWindow.loadFile('index.html');
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
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
