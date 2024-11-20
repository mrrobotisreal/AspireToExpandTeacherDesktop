import { useRef, useEffect } from "react";

interface UseClassroomSocketProps {
  url: string;
  onMessage: (message: string) => void;
}

interface UseClassroomSocketReturns {
  sendMessage: (message: string) => void;
}

const useClassroomSocket = ({
  url,
  onMessage,
}: UseClassroomSocketProps): UseClassroomSocketReturns => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log("Connected to classroom socket");
      };

      socket.onmessage = async (event) => {
        if (onMessage) {
          onMessage(event.data);
        }
      };

      socket.onclose = async (event) => {
        console.warn(
          `Disconnected from classroom socket: ${event.reason} (${event.code})`
        );
      };

      socket.onerror = async (error) => {
        console.error(`Error with classroom socket: ${error}`);
      };

      return () => {
        console.log("Cleaning up classroom socket");
        socket.close();
      };
    }
  }, [url, onMessage]);

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message, classroom socket is not open.");
    }
  };

  return {
    sendMessage,
  };
};

export default useClassroomSocket;
