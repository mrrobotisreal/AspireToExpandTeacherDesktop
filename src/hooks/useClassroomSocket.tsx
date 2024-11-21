import { useCallback, useRef, useEffect } from "react";

export let candidateQueue: RTCIceCandidate[] = [];
export let remoteDescriptionSet = false;

interface UseClassroomSocketProps {
  url: string;
}

interface UseClassroomSocketReturns {
  sendMessage: (message: string) => void;
  peerConnection: RTCPeerConnection;
}

const useClassroomSocket = ({
  url,
}: UseClassroomSocketProps): UseClassroomSocketReturns => {
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    })
  );

  const onMessage = useCallback(async (message: string) => {
    const msgObj = JSON.parse(message);
    if (msgObj.type === "candidate") {
      const candidate = new RTCIceCandidate(msgObj.data);

      if (remoteDescriptionSet) {
        await peerConnection.current.addIceCandidate(candidate);
      } else {
        candidateQueue.push(candidate);
      }
      await peerConnection.current.addIceCandidate(msgObj.data);
    } else if (msgObj.type === "offer") {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(msgObj.data)
      );
      remoteDescriptionSet = true;

      while (candidateQueue.length > 0) {
        const queuedCandidate = candidateQueue.shift();
        await peerConnection.current.addIceCandidate(queuedCandidate!);
      }

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
    } else if (msgObj.type === "answer") {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(msgObj.data)
      );
      remoteDescriptionSet = true;

      while (candidateQueue.length > 0) {
        const queuedCandidate = candidateQueue.shift();
        await peerConnection.current.addIceCandidate(queuedCandidate!);
      }
    }
  }, []);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log("Connected to classroom socket");
      };

      socket.onmessage = async (event) => {
        const rawData = event.data;

        if (rawData instanceof Blob) {
          const textData = await rawData.text();
          const message = JSON.parse(textData);
          onMessage(textData);
        } else if (typeof rawData === "string") {
          const message = JSON.parse(rawData);
          onMessage(rawData);
        } else {
          console.warn(`Received unknown data type: ${typeof rawData}`);
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
    peerConnection: peerConnection.current,
  };
};

export default useClassroomSocket;
