import React, {
  FC,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useTeacherContext } from "../../context/teacherContext";
import { useChatContext } from "../../context/chatContext";
import useChat, { ChatUser, EmitSendMessageParams } from "../../hooks/useChat";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/_chatDialog";
import ChatList from "./chatComponents/_chatList";
import ChatWindow from "./chatComponents/_chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  // const { selectedChat, handleSelectChat, handleExitChat } = useChatContext();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const {
    isRegistering,
    emitCreateChatRoom,
    isCreatingChatRoom,
    emitListChats,
    areChatsLoading,
    emitListMessages,
    areMessagesLoading,
    emitSendMessage,
    emitReadMessages,
    chatSummaries,
    chatMessages,
  } = useChat();
  const [name, setName] = useState<string>("");
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);

  const handleChatSelect = (chatId: string, chatName: string) => {
    localStorage.setItem("selectedChat", chatId);
    setSelectedChat(chatId);
    if (!info.teacherID) {
      console.error("Teacher ID not found");
    }
    setName(chatName);
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
  const handleStartNewChat = (participants: ChatUser[], message: string) => {
    emitCreateChatRoom({
      sender: {
        userId: info.teacherID!,
        userType: "teacher",
        preferredName: info.preferredName!,
        firstName: info.firstName!,
        lastName: info.lastName!,
        profilePictureUrl: info.profilePictureURL || "",
      },
      participants,
      message,
      timestamp: Date.now(),
    });
    handleCloseStartNewChat();
  };

  useEffect(() => {
    localStorage.removeItem("selectedChat");
    localStorage.removeItem("createdChatRoomId");
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    const storedSelectedChat = localStorage.getItem("selectedChat");
    const storedCreatedChatRoomId = localStorage.getItem("createdChatRoomId");
    const storedCreatedChatRoomParticipants = localStorage.getItem(
      "createdChatRoomParticipants"
    );
    if (storedCreatedChatRoomId && storedCreatedChatRoomParticipants) {
      emitListChats({ userId: info.teacherID! });
      const chatParticipants = JSON.parse(storedCreatedChatRoomParticipants);
      const chatName = chatParticipants
        .filter(
          (participant: ChatUser) => participant.userId !== info.teacherID
        )
        .map((participant: ChatUser) => participant.preferredName)
        .join(", ");
      handleChatSelect(storedCreatedChatRoomId, chatName);
      localStorage.removeItem("createdChatRoomId");
      localStorage.removeItem("createdChatRoomParticipants");
    }

    if (
      selectedChat &&
      selectedChat === storedSelectedChat &&
      chatMessages.length > 0
    ) {
      emitReadMessages({
        chatId: selectedChat,
        unreadMessages: chatMessages,
      });
    }

    if (
      storedSelectedChat &&
      storedSelectedChat !== selectedChat &&
      chatMessages
    ) {
      setSelectedChat(storedSelectedChat);
    }
  }, [chatMessages, selectedChat]);

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
            messagesAreLoading={areMessagesLoading || isCreatingChatRoom}
            name={name}
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
