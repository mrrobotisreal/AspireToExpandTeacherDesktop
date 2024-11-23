import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import { HTTP_CHAT_SERVER_URL, MAIN_SERVER_URL } from "../constants/urls";

import { useTeacherContext } from "./teacherContext";

function sleep(duration: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export interface ChatMessage {
  from: string;
  fromID: string;
  to: string;
  toID: string;
  content: string;
  time: number;
}

export interface Chat {
  chatID: string;
  to: string;
  toID: string;
  mostRecentMessage: ChatMessage;
}

const getChatID = (message: ChatMessage): string => {
  if (message.fromID < message.toID) {
    return `${message.fromID}_${message.toID}`;
  }
  return `${message.toID}_${message.fromID}`;
};

export const createChatID = (
  studentID1: string,
  studentID2: string
): string => {
  if (studentID1 < studentID2) {
    return `${studentID1}_${studentID2}`;
  }
  return `${studentID2}_${studentID1}`;
};

export interface Student {
  studentid: string;
  preferredname: string;
  emailaddress: string;
}

interface ChatContextProps {
  chats: Chat[];
  chatsAreLoading: boolean;
  fetchChats: (studentId: string) => void;
  messages: ChatMessage[];
  messagesAreLoading: boolean;
  fetchMessages: (chatId: string) => void;
  sendMessage: (message: ChatMessage) => void;
  students: Student[];
  studentsAreLoading: boolean;
  fetchAllStudents: () => Promise<Student[]>;
}

const ChatContext = createContext<ChatContextProps>({
  chats: [],
  chatsAreLoading: false,
  fetchChats: async (studentId: string) => {},
  messages: [],
  messagesAreLoading: false,
  fetchMessages: async (chatId: string) => {},
  sendMessage: async (message: ChatMessage) => {},
  students: [],
  studentsAreLoading: false,
  fetchAllStudents: async () => [],
});

export const useChatContext = () => useContext<ChatContextProps>(ChatContext);

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { info } = useTeacherContext();
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsAreLoading, setChatsAreLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesAreLoading, setMessagesAreLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsAreLoading, setStudentsAreLoading] = useState(false);

  const fetchChats = async (studentId: string) => {
    try {
      setChatsAreLoading(true);
      const response = await fetch(
        `${HTTP_CHAT_SERVER_URL}/chats?studentID=${studentId}`
      );
      const data = await response.json();

      if (!data) {
        localStorage.setItem("chats", JSON.stringify([]));
        await sleep(1500); // TODO: remove this; for testing only right now
        setChatsAreLoading(false);
        return;
      }

      const sortedData = data.sort((a: Chat, b: Chat) => {
        if (a.mostRecentMessage.time > b.mostRecentMessage.time) return -1;
        if (a.mostRecentMessage.time < b.mostRecentMessage.time) return 1;
        return 0;
      });

      setChats(sortedData);

      localStorage.setItem("chats", JSON.stringify(sortedData));
      await sleep(1500); // TODO: remove this; for testing only right now
      setChatsAreLoading(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChatsAreLoading(false);
    }
  };

  const fetchMessages = async (chatId: string, page = 1) => {
    // TODO: Implement pagination
    try {
      setMessagesAreLoading(true);
      const response = await fetch(
        `${HTTP_CHAT_SERVER_URL}/messages?chatID=${chatId}&limit=50&page=${page}`
      );
      const data = await response.json();

      if (!data) {
        setMessages([]);
        localStorage.setItem(`messages_${chatId}_${page}`, JSON.stringify([]));
        await sleep(1500); // TODO: remove this; for testing only right now
        setMessagesAreLoading(false);
        return;
      }
      setMessages(data);

      // TODO: Implement pagination and syncing with the server
      const key = `messages_${chatId}_${page}`;
      localStorage.setItem(key, JSON.stringify(data));
      await sleep(1500);
      setMessagesAreLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessagesAreLoading(false);
    }
  };

  const sendMessage = (message: ChatMessage) => {
    const chatId = getChatID(message);
    const updatedMessages = [...messages, message];
    const key = `messages_${chatId}_1`; // TODO: Implement pagination

    window.electronAPI.sendMessage(message);
    setMessages(updatedMessages);
    localStorage.setItem(key, JSON.stringify(updatedMessages));
  };

  const fetchAllStudents = async () => {
    try {
      setStudentsAreLoading(true);
      const response = await fetch(`${MAIN_SERVER_URL}/students`);
      const data = await response.json();

      console.log("Students:", JSON.stringify(data, null, 2));

      // TODO: Implement pagination
      setStudents(data);

      localStorage.setItem("students", JSON.stringify(data));

      const filteredStudents = data.filter(
        (student: Student) => student.preferredname !== info.preferredName
      );
      await sleep(1500); // TODO: remove this; for testing only right now
      setStudentsAreLoading(false);

      return filteredStudents;
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentsAreLoading(false);
    }
  };

  const values = {
    chats,
    chatsAreLoading,
    fetchChats,
    messages,
    messagesAreLoading,
    fetchMessages,
    sendMessage,
    students,
    studentsAreLoading,
    fetchAllStudents,
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
