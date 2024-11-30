/**
 * THIS FILE IS FOR TESTING PURPOSES ONLY
 */
import { useCallback, useRef, useEffect, useMemo } from "react";

import { VIDEO_SERVER_URL } from "../constants/urls";

const url = `${VIDEO_SERVER_URL}/?type=teacher&room=123`;
// const remoteDescriptions: { [id: string]: boolean } = {};
// const candidateQueue: RTCIceCandidate[] = [];

interface UseClassroomProps {
  addParticipant: (id: string, stream: MediaStream) => void;
  removeParticipant: (id: string) => void;
  localStream: MediaStream | null;
}

export interface UseClassroomReturns {
  peerConnections: { [id: string]: RTCPeerConnection };
  sendMessage: (message: string) => void;
  broadcastOffer: () => void;
}

const peerConnectionsRef: { current: { [id: string]: RTCPeerConnection } } = {
  current: {},
};

const useClassroom = ({
  addParticipant,
  removeParticipant,
  localStream,
}: UseClassroomProps): UseClassroomReturns => {
  // const peerConnectionsRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const currentPeerConnections = useMemo(
    () => peerConnectionsRef.current,
    [peerConnectionsRef.current]
  );
  const socketRef = useRef<WebSocket | null>(null);
  // const initialPeerConnection: RTCPeerConnection = new RTCPeerConnection({
  //   iceServers: [
  //     { urls: "stun:stun.l.google.com:19302" },
  //     { urls: "stun:stun1.l.google.com:19302" },
  //     { urls: "stun:stun2.l.google.com:19302" },
  //     { urls: "stun:stun3.l.google.com:19302" },
  //     { urls: "stun:stun4.l.google.com:19302" },
  //   ],
  // });
  // localStream
  //   ?.getTracks()
  //   .forEach((track) => initialPeerConnection.addTrack(track, localStream));
  // initialPeerConnection.ontrack = (event) => {
  //   console.log("Received remote stream from", "Student1");
  //   const remoteStream = new MediaStream(event.streams[0].getTracks());
  //   addParticipant("Student1", remoteStream);
  // };
  // initialPeerConnection.onicecandidate = (event) => {
  //   console.log("Sending ICE candidate to", "Student1");
  //   console.log(JSON.stringify(event.candidate, null, 2));
  //   if (event.candidate) {
  //     sendMessage(
  //       JSON.stringify({
  //         type: "candidate",
  //         target: "Student1",
  //         data: event.candidate,
  //       })
  //     );
  //   }
  // };

  const createPeerConnection = useCallback((id: string) => {
    console.log("Creating peer connection with", id);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    });

    localStream
      ?.getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      console.log("Received remote stream from", id);
      const remoteStream = new MediaStream(event.streams[0].getTracks());
      addParticipant(id, remoteStream);
    };

    peerConnection.onicecandidate = (event) => {
      console.log("Sending ICE candidate to", id);
      console.log(JSON.stringify(event.candidate, null, 2));
      if (event.candidate) {
        sendMessage(
          JSON.stringify({
            type: "candidate",
            target: id,
            data: event.candidate,
          })
        );
      }
    };

    if (peerConnectionsRef.current) {
      console.log("Setting peer connection on peerConnectionsRef for", id);
      peerConnectionsRef.current[id] = peerConnection;
      console.log("peerConnectionsRef NOW:", peerConnectionsRef.current);
    }

    return peerConnection;
  }, []);

  const handleOffer = useCallback(async (data: string) => {
    console.log("Received offer");
    const message = JSON.parse(data);
    console.log(JSON.stringify(message, null, 2));
    const peerConnection = createPeerConnection(message.target);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.data)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendMessage(
      JSON.stringify({
        type: "answer",
        target: message.target,
        data: answer,
      })
    );
  }, []);

  const handleCandidate = useCallback(async (data: string) => {
    console.log("Received ICE candidate");
    const message = JSON.parse(data);
    console.log(JSON.stringify(message, null, 2));
    const peerConnection = peerConnectionsRef.current[message.target];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
    }
  }, []);

  const handleAnswer = useCallback(async (data: string) => {
    console.log("Received answer");
    const message = JSON.parse(data);
    console.log(JSON.stringify(message, null, 2));
    const peerConnection = peerConnectionsRef.current[message.target];
    if (!peerConnection) {
      console.error(
        "Peer connection not found for answer from",
        message.target
      );
      return;
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.data)
    );
  }, []);

  const sendMessage = useCallback((message: string) => {
    console.log("Sending message:");
    console.log(JSON.stringify(JSON.parse(message), null, 2));
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending message to classroom socket");
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message, classroom socket is not open.");
    }
  }, []);

  const onMessage = useCallback(async (data: string) => {
    console.log("Received message:");
    const message = JSON.parse(data);
    console.log(JSON.stringify(message, null, 2));

    if (message.type === "offer") {
      await handleOffer(data);
    } else if (message.type === "candidate") {
      await handleCandidate(data);
    } else if (message.type === "answer") {
      await handleAnswer(data);
    }
  }, []);

  const broadcastOffer = () => {
    const peerConnectionsIDs = Object.keys(peerConnectionsRef.current);
    console.log("Broadcasting offer to all participants");
    console.log("Participants: ", peerConnectionsIDs);
    peerConnectionsIDs.forEach(async (ID) => {
      console.log("Creating offer for participant: ", ID);
      const offer = await peerConnectionsRef.current[ID].createOffer();
      console.log(`Offer created for participant ${ID}: `, offer);
      await peerConnectionsRef.current[ID].setLocalDescription(offer);
      sendMessage(
        JSON.stringify({
          type: "offer",
          target: ID,
          data: offer,
        })
      );
    });
  };

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
        console.error(
          `Error with classroom socket: ${JSON.stringify(error, null, 2)}`
        );
      };

      return () => {
        socket.close();
      };
    }
  }, [onMessage]);

  useEffect(() => {
    if (socketRef.current && localStream) {
      createPeerConnection("Student1");
    }
  }, [socketRef.current, localStream]);

  return {
    peerConnections: currentPeerConnections,
    sendMessage,
    broadcastOffer,
  };
};

export default useClassroom;
