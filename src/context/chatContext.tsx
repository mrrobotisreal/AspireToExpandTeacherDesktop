import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { io, Socket } from "socket.io-client";

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
  is_to_teacher: boolean;
  is_from_teacher: boolean;
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
  student_id: string;
  preferred_name: string;
  email_address: string;
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
  _sendMessage: (roomId: string, content: string) => void;
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
  _sendMessage: (roomId: string, content: string) => {},
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [_messages, _setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    let newSocket: Socket | null = null;

    // Register the user
    if (info.teacherID) {
      // newSocket = io("http://localhost:11114");
      // setSocket(newSocket);
      // newSocket.emit("registerUser", {
      //   userId: info.teacherID,
      //   userType: "teacher",
      //   preferredName: info.preferredName,
      //   firstName: info.firstName,
      //   lastName: info.lastName,
      //   profilePictureUrl: info.profilePictureURL,
      // });
    }

    // Fetch missed messages
    // newSocket.emit("fetchMissedMessages", info.teacherID);

    // Handle missed messages
    // newSocket.on("missedMessages", ({ roomId, messages }) => {
    //   console.log("Missed messages:", messages);
    //   // _setMessages((prev) => [...prev, ...messages]);
    // });

    // Handle new messages
    if (info.teacherID && newSocket) {
      // newSocket.on("newMessage", ({ roomId, sender, content }) => {
      //   console.log("New message:", { sender, content });
      //   // _setMessages((prev) => [...prev, { sender, content }]);
      // });
    }

    return () => {
      if (newSocket) {
        // newSocket.disconnect();
      }
    };
  }, [info.teacherID]);

  const _sendMessage = (roomId: string, content: string) => {
    socket?.emit("sendMessage", { roomId, sender: info.teacherID, content });
  };

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

  const sendMessage = async (message: ChatMessage) => {
    const chatId = getChatID(message);
    const updatedMessages = [...messages, message];
    const key = `messages_${chatId}_1`; // TODO: Implement pagination

    // window.electronAPI.sendMessage(message); // TODO: fix websockets later
    try {
      const response = await fetch(`${HTTP_CHAT_SERVER_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(message),
      });
      if (response.status === 200) {
        console.log("Message sent successfully");
        setMessages(updatedMessages);
        localStorage.setItem(key, JSON.stringify(updatedMessages));
      } else {
        console.error(
          "Issue sending message:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setStudentsAreLoading(true);
      const response = await fetch(
        `${MAIN_SERVER_URL}/students?page=1&limit=100`
      );
      const data = await response.json();

      console.log("Students:", JSON.stringify(data.students, null, 2));

      // TODO: Implement pagination
      setStudents(data.students);

      localStorage.setItem("students", JSON.stringify(data.students));

      const filteredStudents = data.students.filter(
        (student: Student) => student.preferred_name !== info.preferredName
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
    _sendMessage,
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
