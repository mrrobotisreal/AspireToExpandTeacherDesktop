import React, { FC, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useChatContext, Chat } from "../../context/chatContext";
import { useStudentContext } from "../../context/studentContext";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/chatDialog";
import ChatList from "./chatComponents/chatList";
import ChatWindow from "./chatComponents/chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useStudentContext();
  const {
    chats: _chats,
    chatsAreLoading,
    fetchChats,
    messages: _messages,
    messagesAreLoading,
    fetchMessages,
    sendMessage,
  } = useChatContext();
  const chats = useMemo(() => _chats, [_chats]);
  const messages = useMemo(() => _messages, [_messages]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);

  const handleChatSelect = (chatID: string) => {
    setSelectedChat(chatID);
  };

  const getNameAndID = () => {
    if (selectedChat && chats.length) {
      const chat = chats.find((chat) => chat.chatID === selectedChat)!;
      return {
        name:
          chat.to === info.preferredName
            ? chat.mostRecentMessage.from
            : chat.to,
        toID:
          chat.toID === info.studentId
            ? chat.mostRecentMessage.fromID
            : chat.toID,
      };
    } else {
      return {
        name: "",
        toID: "",
      };
    }
  };
  const { name, toID } = getNameAndID();

  const handleTextMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextMessage(event.target.value);
  };

  const handleClickAttach = () => {
    console.log("Attach clicked");
  };

  const handleClickSend = (name: string, toID: string) => {
    console.log("handling send...");
    const message = {
      from: info.preferredName!,
      fromID: info.studentId!,
      to: name,
      toID: toID,
      content: textMessage.trim(),
      time: Date.now(),
    };
    sendMessage(message);
    setTextMessage("");
  };

  const handleOpenStartNewChat = () => setIsStartNewChatOpen(true);
  const handleCloseStartNewChat = () => setIsStartNewChatOpen(false);

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    if (info.studentId && selectedChat) {
      fetchMessages(selectedChat!);
    } else if (info.studentId) {
      fetchChats(info.studentId!);
    }
  }, [info, selectedChat]);

  return (
    <Layout title={intl.formatMessage({ id: "common_chat" })}>
      <Grid container sx={{ height: "84vh" }}>
        <Grid item xs={4} md={3}>
          <ChatList
            chats={chats}
            chatsAreLoading={chatsAreLoading}
            onChatSelect={handleChatSelect}
            selectedChat={selectedChat}
            handleStartNewChat={handleOpenStartNewChat}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <ChatWindow
            selectedChat={selectedChat}
            messages={messages}
            messagesAreLoading={messagesAreLoading}
            name={name}
            toID={toID}
            textMessage={textMessage}
            handleTextMessageChange={handleTextMessageChange}
            handleClickAttach={handleClickAttach}
            handleClickSend={handleClickSend}
          />
        </Grid>
      </Grid>
      <ChatDialog
        isStartNewChatOpen={isStartNewChatOpen}
        handleCloseStartNewChat={handleCloseStartNewChat}
      />
    </Layout>
  );
};

export default Chat;
