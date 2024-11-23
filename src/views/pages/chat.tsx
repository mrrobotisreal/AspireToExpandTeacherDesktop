import React, { FC, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useChatContext, Chat, createChatID } from "../../context/chatContext";
import { useTeacherContext } from "../../context/teacherContext";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/chatDialog";
import ChatList from "./chatComponents/chatList";
import ChatWindow from "./chatComponents/chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  const {
    chats,
    chatsAreLoading,
    fetchChats,
    messages: _messages,
    messagesAreLoading,
    fetchMessages,
    sendMessage,
  } = useChatContext();
  const messages = useMemo(() => _messages, [_messages]);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [toID, setToID] = useState<string>("");
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);

  const handleChatSelect = (chatID: string) => {
    setSelectedChat(chatID);
  };

  const getNameAndID = () => {
    if (selectedChat && allChats.length) {
      const chat = chats.find((chat) => chat.chatID === selectedChat)!;
      return {
        name:
          chat.to === info.preferredName
            ? chat.mostRecentMessage.from
            : chat.to,
        toID:
          chat.toID === info.teacherID
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
      fromID: info.teacherID!,
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
  const handleStartNewChat = (name: string, toID: string) => {
    setName(name);
    setToID(toID);
    const chatID = createChatID(info.teacherID!, toID);
    setSelectedChat(chatID);
    setAllChats([
      {
        chatID,
        to: name,
        toID,
        mostRecentMessage: {
          from: info.preferredName!,
          fromID: info.teacherID!,
          to: name,
          toID,
          content: "",
          time: Date.now(),
        },
      },
      ...allChats,
    ]);
    handleCloseStartNewChat();
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    if (info.teacherID && selectedChat) {
      fetchMessages(selectedChat!);
    } else if (info.teacherID) {
      fetchChats(info.teacherID!);
    }
    getNameAndID();
  }, [info, selectedChat]);

  useEffect(() => {
    setAllChats(chats);
  }, [chats]);

  return (
    <Layout title={intl.formatMessage({ id: "common_chat" })}>
      <Grid container sx={{ height: "84vh" }}>
        <Grid item xs={4} md={3}>
          <ChatList
            chats={allChats}
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
        handleStartNewChat={handleStartNewChat}
      />
    </Layout>
  );
};

export default Chat;
