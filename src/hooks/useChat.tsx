import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { HTTP_CHAT_SERVER_URL, MAIN_SERVER_URL } from "../constants/urls";
import { useTeacherContext } from "../context/teacherContext";
// import { useChatContext } from "../context/chatContext";

export interface ChatUser {
  userId: string;
  userType: string;
  preferredName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  sender: ChatUser;
  content: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  timestamp: number;
  isReceived: boolean;
  isRead: boolean;
  isDeleted: boolean;
}

export interface Chat {
  chatId: string;
  participants: ChatUser[];
  messages: ChatMessage[];
}

export interface Chats {
  [chatId: string]: Chat;
}

export interface ChatSummary {
  chatId: string;
  participants: ChatUser[];
  latestMessage: ChatMessage;
}

interface EmitRegisterUserParams {
  userId: string;
  userType: string;
  preferredName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

interface EmitListChatsParams {
  userId: string;
}

interface EmitListMessagesParams {
  roomId: string;
  userId: string;
}

export interface EmitSendMessageParams {
  roomId: string;
  sender: ChatUser;
  message: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  timestamp: number;
}

export interface EmitReadMessagesParams {
  chatId: string;
  unreadMessages: ChatMessage[];
}

export interface EmitCreateChatRoomParams {
  sender: ChatUser;
  participants: ChatUser[];
  message: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  timestamp: number;
}

interface UseChatReturns {
  emitRegisterUser: (params: EmitRegisterUserParams) => void;
  isRegistering: boolean;
  emitCreateChatRoom: (params: EmitCreateChatRoomParams) => void;
  isCreatingChatRoom: boolean;
  emitListChats: (params: EmitListChatsParams) => void;
  areChatsLoading: boolean;
  clearMessages: () => void;
  emitListMessages: (params: EmitListMessagesParams) => void;
  areMessagesLoading: boolean;
  emitSendMessage: (params: EmitSendMessageParams) => void;
  emitReadMessages: (params: EmitReadMessagesParams) => void;
  chats: Chats;
  chatSummaries: ChatSummary[];
  chatMessages: ChatMessage[];
}

const useChat = (): UseChatReturns => {
  const { info, getInfo } = useTeacherContext();
  // const { selectedChat, handleSelectChat } = useChatContext();
  const socketRef = useRef<Socket | null>(null);
  // const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCreatingChatRoom, setIsCreatingChatRoom] = useState(false);
  const [createdChatRoomId, setCreatedChatRoomId] = useState<string | null>(
    null
  );
  const [chats, setChats] = useState<Chats>({});
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [areChatsLoading, setAreChatsLoading] = useState(false);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [areMessagesLoading, setAreMessagesLoading] = useState(false);

  // User registration
  const emitRegisterUser = (params: EmitRegisterUserParams) => {
    setIsRegistering(true);
    socketRef.current?.emit("registerUser", params);
  };
  const onUserRegistered = ({ userId }: { userId: string }) => {
    setIsRegistering(false);
    setIsRegistered(true);
    emitListChats({ userId });
  };
  const onRegisterUserError = (error: string) => {
    console.error("Error registering user:", error);
  };

  // Create Chat Room
  const emitCreateChatRoom = (params: EmitCreateChatRoomParams) => {
    setIsCreatingChatRoom(true);
    socketRef.current?.emit("createChatRoom", {
      newRoomId: uuidv4(),
      ...params,
    });
  };
  const onCreateChatRoomError = ({
    errorMessage,
    sender,
    participants,
    message,
    imageUrl,
    thumbnailUrl,
    audioUrl,
    timestamp,
  }: {
    errorMessage: string;
    sender: ChatUser;
    participants: ChatUser[];
    message: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    timestamp: number;
  }) => {
    if (errorMessage.includes("RoomId already exists")) {
      console.log("Chat room already exists, trying again...");
      emitCreateChatRoom({
        sender,
        participants,
        message,
        imageUrl,
        thumbnailUrl,
        audioUrl,
        timestamp,
      });
    } else {
      console.error("Error creating chat room:", errorMessage);
      setIsCreatingChatRoom(false);
    }
  };
  const onChatRoomCreated = (incomingChatRoom: Chat) => {
    console.log("Chat room created:", incomingChatRoom);
    localStorage.setItem("createdChatRoomId", incomingChatRoom.chatId);
    localStorage.setItem(
      "createdChatRoomParticipants",
      JSON.stringify(incomingChatRoom.participants)
    );
    localStorage.setItem("selectedChat", incomingChatRoom.chatId);
    if (!chats[incomingChatRoom.chatId]) {
      setChats({
        ...chats,
        [incomingChatRoom.chatId]: incomingChatRoom,
      });
    } else {
      const newChats = {
        ...chats,
        [incomingChatRoom.chatId]: incomingChatRoom,
      };
      setChats(newChats);
    }
    setChatMessages(incomingChatRoom.messages);
    setCreatedChatRoomId(incomingChatRoom.chatId);
    setIsCreatingChatRoom(false);
  };

  // Chats List
  const emitListChats = (params: EmitListChatsParams) => {
    setAreChatsLoading(true);
    setAreChatsLoaded(false);
    socketRef.current?.emit("listChatRooms", params);
  };
  const onChatsList = (chatsList: ChatSummary[]) => {
    const sortedChats = chatsList.toSorted(
      (a, b) => b.latestMessage.timestamp - a.latestMessage.timestamp // TODO: let backend sort this
    );
    setChatSummaries(sortedChats);
    setAreChatsLoading(false);
    setAreChatsLoaded(true);
  };
  const onListChatsError = (error: string) => {
    console.error("Error listing chats:", error);
  };

  // Messages List
  const clearMessages = () => {
    setChatMessages([]);
  };
  const emitListMessages = (params: EmitListMessagesParams) => {
    setAreMessagesLoading(true);
    socketRef.current?.emit("listMessages", params);
  };
  const onMessagesList = ({
    chatId,
    participants,
    messagesList,
  }: {
    chatId: string;
    participants: ChatUser[];
    messagesList: ChatMessage[];
  }) => {
    if (!chats[chatId]) {
      setChats({
        ...chats,
        [chatId]: {
          chatId,
          participants,
          messages: messagesList,
        },
      });
    } else {
      const newChats = {
        ...chats,
        [chatId]: {
          chatId,
          participants,
          messages: messagesList,
        },
      };
      setChats(newChats);
    }
    const selectedChat = localStorage.getItem("selectedChat");
    if (selectedChat && chatId === selectedChat) {
      setChatMessages(messagesList);
    }
    setAreMessagesLoading(false);
  };

  // Message Sending & Receiving
  const emitSendMessage = (params: EmitSendMessageParams) => {
    socketRef.current?.emit("sendMessage", params);
  };
  const emitReadMessages = (params: EmitReadMessagesParams) => {
    const { chatId, unreadMessages } = params;
    let teacherId: string | undefined = info.teacherID;
    // This is a workaround for the teacherID not being available in the info object until I can track down where it's being overwritten
    if (!teacherId) {
      console.log("No teacherID...");
      console.log("Getting stored info...");
      const storedInfo = getInfo();
      teacherId = storedInfo?.teacherID;
      if (!teacherId) {
        console.error("Sorry! No teacherID! Exiting...");
        return;
      }
    }
    const unreadMessageIds: string[] = [];
    unreadMessages.forEach((msg) => {
      if (msg.sender.userId !== teacherId && !msg.isRead) {
        unreadMessageIds.push(msg.messageId);
      }
    });
    if (!socketRef.current) {
      console.error("Socket not found");
      return;
    }
    socketRef.current?.emit("readMessages", {
      roomId: chatId,
      unreadMessages: unreadMessageIds,
    });
  };
  const onMessageReceived = (message: ChatMessage) => {}; // TODO: implement this
  const onMessageRead = (messageId: string) => {}; // TODO: implement this
  const onNewMessage = (incomingChat: Chat) => {
    const updatedChats = {
      ...chats,
      [incomingChat.chatId]: incomingChat,
    };
    setChats(updatedChats);
    socketRef.current?.emit("receiveMessage", incomingChat.messages[0]);
    const selectedChat = localStorage.getItem("selectedChat");
    if (selectedChat && selectedChat === incomingChat.chatId) {
      setChatMessages(incomingChat.messages);
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      const newSocket: Socket = io("http://localhost:11114");
      newSocket.on("userRegistered", onUserRegistered);
      newSocket.on("registerUserError", onRegisterUserError);
      newSocket.on("chatRoomCreated", onChatRoomCreated);
      newSocket.on("createChatRoomError", onCreateChatRoomError);
      newSocket.on("chatsList", onChatsList);
      newSocket.on("listChatsError", onListChatsError);
      newSocket.on("messagesList", onMessagesList);
      newSocket.on("messageReceived", onMessageReceived);
      newSocket.on("messageRead", onMessageRead);
      newSocket.on("newMessage", onNewMessage);
      socketRef.current = newSocket;
    }

    if (
      socketRef.current &&
      !isRegistered &&
      info.teacherID &&
      info.preferredName &&
      info.firstName &&
      info.lastName
    ) {
      emitRegisterUser({
        userId: info.teacherID,
        userType: "teacher",
        preferredName: info.preferredName,
        firstName: info.firstName,
        lastName: info.lastName,
        profilePictureUrl: info.profilePictureURL || "",
      });
    }

    if (socketRef.current && isRegistered && info.teacherID) {
      emitListChats({ userId: info.teacherID });
    }
  }, [
    info.teacherID,
    info.preferredName,
    info.firstName,
    info.lastName,
    info.profilePictureURL,
    socketRef.current,
    isRegistered,
  ]);

  return {
    emitRegisterUser,
    isRegistering,
    emitCreateChatRoom,
    isCreatingChatRoom,
    emitListChats,
    areChatsLoading,
    clearMessages,
    emitListMessages,
    areMessagesLoading,
    emitSendMessage,
    emitReadMessages,
    chats,
    chatSummaries,
    chatMessages,
  };
};

export default useChat;
