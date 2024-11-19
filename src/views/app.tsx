import React, { FC, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { IntlProvider } from "react-intl";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import TeacherContextProvider from "../context/teacherContext";
import ChatContextProvider from "../context/chatContext";
import { useThemeContext } from "../context/themeContext";
import { useMessagesContext } from "../context/messagesContext";

import Login from "./login";
import Chat from "./pages/chat";
import Classroom from "./pages/classroom";
import Home from "./pages/home";
import ProfileSettings from "./pages/profileSettings";
import Settings from "./pages/settings";

const defaultLocale = "en";
let initialLocale = defaultLocale;

async function getLocale(): Promise<string> {
  const locale = await window.electronAPI.getLocale();
  initialLocale = locale;

  return locale;
}
getLocale();

const App: FC = () => {
  const { themeMode, theme } = useThemeContext();
  const { locale, messages, changeLocale } = useMessagesContext();

  useEffect(() => {
    changeLocale(initialLocale);
  }, [initialLocale]);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ThemeProvider theme={theme}>
        <TeacherContextProvider>
          <ChatContextProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/home" element={<Home />} />
                <Route path="/classroom" element={<Classroom />} />
                <Route path="/chat" element={<Chat />} />
                {/* <Route path="/lessons" element={} /> */}
                {/* <Route path="/assignments" element={} /> */}
                {/* <Route path="/games" element={} /> */}
                {/* <Route path="/profile" element={} /> */}
              </Routes>
            </Router>
          </ChatContextProvider>
        </TeacherContextProvider>
      </ThemeProvider>
    </IntlProvider>
  );
};

export default App;
