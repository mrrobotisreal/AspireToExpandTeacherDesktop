import React, { FC, useEffect, useState, useRef, useMemo } from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useTeacherContext } from "../../context/teacherContext";
import useChat, { EmitSendMessageParams } from "../../hooks/useChat";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/_chatDialog";
import ChatList from "./chatComponents/_chatList";
import ChatWindow from "./chatComponents/_chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const {
    emitRegisterUser,
    isRegistering,
    emitListChats,
    areChatsLoading,
    emitListMessages,
    areMessagesLoading,
    emitSendMessage,
    chats,
    chatSummaries,
    chatMessages,
  } = useChat();
  const [name, setName] = useState<string>("");
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    if (!info.teacherID) {
      console.error("Teacher ID not found");
    }
    emitListMessages({ roomId: chatId, userId: info.teacherID! });
  };

  const handleTextMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextMessage(event.target.value);
  };

  const handleClickAttach = () => {
    console.log("Attach clicked");
  };

  const handleClickSend = () => {
    if (!info.teacherID) {
      console.error("Teacher ID not found");
    }
    const newMessage: EmitSendMessageParams = {
      roomId: selectedChat!,
      sender: {
        userId: info.teacherID!,
        userType: "teacher",
        preferredName: info.preferredName!,
        firstName: info.firstName!,
        lastName: info.lastName!,
        profilePictureUrl: info.profilePictureURL!,
      },
      message: textMessage,
      timestamp: Date.now(),
    };
    console.log("Sending message", JSON.stringify(newMessage, null, 2));
    emitSendMessage(newMessage);
    setTextMessage("");
  };

  const handleOpenStartNewChat = () => setIsStartNewChatOpen(true);
  const handleCloseStartNewChat = () => setIsStartNewChatOpen(false);
  const handleStartNewChat = (name: string, toID: string) => {
    setName(name);
    handleCloseStartNewChat();
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();
    console.log(
      "storedStudentInfo",
      JSON.stringify(storedStudentInfo, null, 2)
    );

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_chat" })}>
      <Grid container sx={{ height: "84vh" }}>
        <Grid item xs={4} md={3}>
          <ChatList
            chats={chatSummaries}
            chatsAreLoading={isRegistering || areChatsLoading}
            onChatSelect={handleChatSelect}
            selectedChat={selectedChat}
            handleStartNewChat={handleOpenStartNewChat}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <ChatWindow
            selectedChat={selectedChat}
            messages={chatMessages}
            messagesAreLoading={areMessagesLoading}
            name={name}
            // toID={toID}
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
