import * as React from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/style.css";

import App from "./views/app";
import MessagesProvider from "./context/messagesContext";
import ThemeProvider from "./context/themeContext";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <ThemeProvider>
    <MessagesProvider>
      <App />
    </MessagesProvider>
  </ThemeProvider>
);
