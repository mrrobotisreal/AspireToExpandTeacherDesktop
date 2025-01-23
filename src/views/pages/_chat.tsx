import React, { FC, RefObject, useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { Cancel, Phone } from "@mui/icons-material";

import { useTeacherContext } from "../../context/teacherContext";
import { useThemeContext } from "../../context/themeContext";
import useChat, {
  ChatUser,
  EmitCreateChatRoomParams,
  EmitSendMessageParams,
} from "../../hooks/useChat";
import useUploadImage from "../../hooks/useUploadImage";
import useUploadAudio from "../../hooks/useUploadAudio";
import Layout from "../layout/layout";
import Text from "../text/text";
import { MAIN_SERVER_URL } from "../../constants/urls";

import CallDialog from "./chatComponents/_callDialog";
import ChatDialog from "./chatComponents/_chatDialog";
import ChatList from "./chatComponents/_chatList";
import ChatWindow from "./chatComponents/_chatWindow";

export type CallType =
  | "incomingAudio"
  | "outgoingAudio"
  | "incomingVideo"
  | "outgoingVideo"
  | null;

export interface ChatVideoRefObject {
  id: string;
  label: string;
  profilePictureUrl: string;
  ref: RefObject<HTMLVideoElement>;
}

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  const { theme, heavyFont, regularFont } = useThemeContext();
  const { uploadChatImage } = useUploadImage();
  const { uploadAudioMessage } = useUploadAudio();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [textMessage, setTextMessage] = useState<string>("");
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [callType, setCallType] = useState<CallType>("outgoingVideo");
  const [callSettingsAnchorEl, setCallSettingsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceID, setSelectedAudioDeviceID] =
    useState<string>("");
  const [selectedAudioDeviceLabel, setSelectedAudioDeviceLabel] =
    useState<string>("");
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceID, setSelectedVideoDeviceID] =
    useState<string>("");
  const [selectedVideoDeviceLabel, setSelectedVideoDeviceLabel] =
    useState<string>("");
  const [activeVideoTrack, setActiveVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [activeAudioTrack, setActiveAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [isRemoteStreamActive, setIsRemoteStreamActive] = useState(false);
  const [isCallIncomingDialogOpen, setIsCallIncomingDialogOpen] =
    useState(false);
  const [answer, setAnswer] = useState<any>(null);
  const [incomingCallerId, setIncomingCallerId] = useState<string | null>(null);
  const [incomingCallPreferredName, setIncomingCallPreferredName] = useState<
    string | null
  >(null);
  const [incomingCallProfilePictureUrl, setIncomingCallProfilePictureUrl] =
    useState<string | null>(null);
  // const [incomingCallPreferredName, setIncomingCallPreferredName] = useState<
  //   string | null
  // >("Mitch");
  // const [incomingCallProfilePictureUrl, setIncomingCallProfilePictureUrl] =
  //   useState<string | null>(
  //     "https://aspirewithalina.com:8888/uploads/profileImages/df78d663_5801_41ba_ac65_7a7415a2e6c6.png"
  //   );
  const handleAnswerRejectIncomingCall = async (
    createdAnswer: any,
    callerId: string
  ) => {
    console.log("Answering call from:", callerId);
    setAnswer(createdAnswer);
    setIncomingCallerId(callerId);
    const studentInfoResponse = await fetch(
      `${MAIN_SERVER_URL}/student?studentID=${callerId}`
    );
    if (studentInfoResponse.status === 200) {
      const callerInfo = await studentInfoResponse.json();
      console.log("Student Caller info:", JSON.stringify(callerInfo, null, 2));
      console.log("Caller preferred name:", callerInfo.student.preferred_name);
      console.log(
        "Caller profile picture URL:",
        callerInfo.student.profile_picture_url
      );
      setIncomingCallPreferredName(callerInfo.student.preferred_name);
      setIncomingCallProfilePictureUrl(callerInfo.student.profile_picture_url);
      setIsCallIncomingDialogOpen(true);
      return;
    }
    const teacherInfoResponse = await fetch(
      `${MAIN_SERVER_URL}/teacher?teacherID=${callerId}`
    );
    if (teacherInfoResponse.status === 200) {
      const callerInfo = await teacherInfoResponse.json();
      console.log("Teacher Caller info:", JSON.stringify(callerInfo, null, 2));
      setIncomingCallPreferredName(callerInfo.teacher.preferred_name);
      setIncomingCallProfilePictureUrl(callerInfo.teacher.profile_picture_url);
      setIsCallIncomingDialogOpen(true);
      return;
    }
  };
  const {
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
    chatSummaries,
    chatMessages,
    // peerConnection,
    emitCallUser,
    emitAnswerCall,
    emitSendIceCandidate,
  } = useChat({ handleAnswerRejectIncomingCall });
  // peerConnection.onicecandidate = (event) => {
  //   if (event.candidate) {
  //     emitSendIceCandidate({
  //       to: recipients[0]?.userId,
  //       candidate: event.candidate,
  //     });
  //   }
  // };
  // peerConnection.ontrack = (event) => {
  //   if (remoteVideoRef.current) {
  //     remoteVideoRef.current.srcObject = event.streams[0];
  //   }
  //   setIsRemoteStreamActive(true);
  // };
  // peerConnection.onconnectionstatechange = () => {
  //   if (peerConnection.connectionState === "disconnected") {
  //     setIsRemoteStreamActive(false);
  //   }
  // };
  const [recipients, setRecipients] = useState<ChatUser[]>([]);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleChatSelect = (
    chatId: string,
    chatName: string,
    chatUsers: ChatUser[]
  ) => {
    localStorage.setItem("selectedChat", chatId);
    setRecipients(chatUsers);
    setSelectedChat(chatId);
    if (!info.teacherID) {
      console.error("Teacher ID not found");
    }
    setName(chatName);
    emitListMessages({ roomId: chatId, userId: info.teacherID! });
  };
  const handleChatClose = () => {
    clearMessages();
    setSelectedChat(null);
    setName("");
  };

  const handleTextMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextMessage(event.target.value);
  };

  const handleClickAttach = async () => {
    console.log("Attach clicked");
    const filePath = await window.electronAPI.selectImage();

    if (filePath) {
      const fileExtension = filePath.split(".").pop();
      console.log(`File extension: ${fileExtension}`);

      if (!fileExtension) {
        console.error("File extension is required to upload image");
        return;
      }

      if (!info.teacherID || info.teacherID === "") {
        console.error("Student ID is required to upload image");
        return;
      }

      try {
        const uploadedImage = await uploadChatImage(
          filePath,
          fileExtension,
          info.teacherID
        );
        console.log("Uploaded image:", JSON.stringify(uploadedImage, null, 2));
        setImageUrl(uploadedImage?.imageURL || null);
        setThumbnailUrl(uploadedImage?.thumbnailURL || null);
        setIsImageUploaded(true);
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };
  const handleRemoveAttachment = () => {
    console.log("Remove attachment clicked");
    setIsImageUploaded(false);
    setImageUrl(null);
    setThumbnailUrl(null);
  };

  const drawWaveform = (
    analyser: AnalyserNode,
    dataArray: Uint8Array,
    canvas: HTMLCanvasElement
  ) => {
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.fillStyle = "#f3f4f6";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = theme.palette.primary.dark;

      canvasContext.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0; // Normalize data to [0, 2]
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    };

    draw();
  };

  const handleStartRecording = async () => {
    try {
      const audioCtx = new AudioContext();
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 2048;

      const bufferLength = analyserNode.fftSize;
      const dataArr = new Uint8Array(bufferLength);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyserNode);
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsRecording(false);
  };

  const handleDeleteRecording = () => {
    console.log("Delete recording clicked");
    setAudioBlob(null);
    setAudioURL(null);
  };

  const handlePlayAudio = async () => {
    console.log("Play audio clicked");
    if (!audioURL || !canvasRef.current) return;
    console.log("audioURL and canvasRef.current are not null");

    const audioElement = audioRef.current;
    if (!audioElement) return;
    console.log("audioElement is not null");

    if (!audioElement.paused) {
      console.log("Audio is already playing.");
    }

    const audioContext = new AudioContext();
    console.log("Audio context state:", audioContext.state);
    audioContext.resume();
    console.log("Audio context state (after resume):", audioContext.state);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;

    audioElement.play();
    setIsPlayingAudio(true);

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyserRef.current || !audioElement.paused) {
        animationFrameId.current = requestAnimationFrame(draw);
      }

      analyserRef.current?.getByteTimeDomainData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.fillStyle = "#f3f4f6";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = theme.palette.primary.dark;

      canvasContext.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0; // Normalize data to [0, 2]
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    };

    draw();
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-note.webm");

    try {
      const response = await fetch("http://localhost:3000/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Uploaded audio:", JSON.stringify(data, null, 2));
      // onSendAudio(data.audioUrl); // Pass the uploaded audio URL to the parent
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const handleClickSend = async () => {
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
    if (isImageUploaded && imageUrl && thumbnailUrl) {
      newMessage.imageUrl = imageUrl;
      newMessage.thumbnailUrl = thumbnailUrl;
      setIsImageUploaded(false);
      setImageUrl(null);
      setThumbnailUrl(null);
    }
    if (!isRecording && audioBlob && audioURL) {
      const audioResponse = await uploadAudioMessage(audioBlob, selectedChat!);
      newMessage.audioUrl = audioResponse?.audioURL;
      newMessage.message = audioResponse?.filename || "Voice note";
      setAudioBlob(null);
      setAudioURL(null);
    }
    console.log("Sending message", JSON.stringify(newMessage, null, 2));
    emitSendMessage(newMessage);
    setTextMessage("");
  };

  const handleOpenStartNewChat = () => setIsStartNewChatOpen(true);
  const handleCloseStartNewChat = () => setIsStartNewChatOpen(false);
  const handleStartNewChat = async (
    participants: ChatUser[],
    message: string
  ) => {
    const newMessage: EmitCreateChatRoomParams = {
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
    };
    if (isImageUploaded && imageUrl && thumbnailUrl) {
      newMessage.imageUrl = imageUrl;
      newMessage.thumbnailUrl = thumbnailUrl;
      setIsImageUploaded(false);
      setImageUrl(null);
      setThumbnailUrl(null);
    }
    if (!isRecording && audioBlob && audioURL) {
      const audioResponse = await uploadAudioMessage(audioBlob, selectedChat!);
      newMessage.audioUrl = audioResponse?.audioURL;
      newMessage.message = audioResponse?.filename || "Voice note";
      setAudioBlob(null);
      setAudioURL(null);
    }
    emitCreateChatRoom(newMessage);
    handleCloseStartNewChat();
  };

  const handleOpenCallSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCallSettingsAnchorEl(event.currentTarget);
  };
  const handleCloseCallSettingsMenu = () => {
    setCallSettingsAnchorEl(null);
  };
  const toggleVideo = () => {
    if (activeVideoTrack) {
      activeVideoTrack.enabled = !activeVideoTrack.enabled;
      setIsVideoOn(activeVideoTrack.enabled);
    }
  };
  const toggleAudio = () => {
    if (activeAudioTrack) {
      activeAudioTrack.enabled = !activeAudioTrack.enabled;
      setIsAudioOn(activeAudioTrack.enabled);
    }
  };
  const handleSelectVideoDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: { deviceId: { exact: selectedAudioDeviceID } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const videoTrack = stream.getVideoTracks()[0];
      setActiveVideoTrack(videoTrack);
      setSelectedVideoDeviceID(deviceId);
      setSelectedVideoDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting video stream with the selected device: ", // TODO: localize
        error
      );
    }
  };
  const handleSelectAudioDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: selectedVideoDeviceID } },
        audio: { deviceId: { exact: deviceId } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const audioTrack = stream.getAudioTracks()[0];
      setActiveAudioTrack(audioTrack);
      setSelectedAudioDeviceID(deviceId);
      setSelectedAudioDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting audio stream with the selected device: ", // TODO: localize
        error
      );
    }
  };

  const fetchDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioStreamDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );
    const videoStreamDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setAudioDevices(audioStreamDevices);
    setSelectedAudioDeviceID(audioStreamDevices[0].deviceId);
    setSelectedAudioDeviceLabel(audioStreamDevices[0].label);
    setVideoDevices(videoStreamDevices);
    setSelectedVideoDeviceID(videoStreamDevices[0].deviceId);
    setSelectedVideoDeviceLabel(videoStreamDevices[0].label);
  };

  async function broadcastOffer() {
    // if (!peerConnection) {
    //   return;
    // }
    // if (isCallStarted) {
    //   peerConnection.close();
    //   setIsCallStarted(false);
    //   setIsRemoteStreamActive(false);
    //   // TODO: send signal that the call is ended for other participants
    // } else {
    //   const offer = await peerConnection.createOffer();
    //   await peerConnection.setLocalDescription(offer);
    //   emitCallUser({ from: info.teacherID!, to: recipients[0]?.userId, offer });
    //   setIsCallStarted(true);
    // }
  }

  const handleVideoCall = async (isIncoming: boolean) => {
    // console.log("handleVideoCall...");
    // try {
    //   const stream = await navigator.mediaDevices.getUserMedia({
    //     video: true,
    //     audio: true,
    //   });
    //   localStream.current = stream;
    //   if (localVideoRef.current) {
    //     localVideoRef.current.srcObject = stream;
    //   }
    //   stream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, stream);
    //   });
    //   const videoTrack = stream.getVideoTracks()[0];
    //   setActiveVideoTrack(videoTrack);
    //   const audioTrack = stream.getAudioTracks()[0];
    //   setActiveAudioTrack(audioTrack);
    //   setCallType(isIncoming ? "incomingVideo" : "outgoingVideo");
    //   setIsAudioOn(true);
    //   setIsVideoOn(true);
    //   setIsCallOpen(true);
    //   await fetchDevices();
    //   handleSelectAudioDevice(selectedAudioDeviceID, selectedAudioDeviceLabel);
    //   handleSelectVideoDevice(selectedVideoDeviceID, selectedVideoDeviceLabel);
    //   if (!isIncoming) {
    //     broadcastOffer();
    //   }
    // } catch (error) {
    //   console.error("Error starting media: ", error);
    // }
  };
  const handleAudioCall = async (isIncoming: boolean) => {
    // console.log("handleAudioCall...");
    // try {
    //   const stream = await navigator.mediaDevices.getUserMedia({
    //     video: false,
    //     audio: true,
    //   });
    //   localStream.current = stream;
    //   if (localVideoRef.current) {
    //     localVideoRef.current.srcObject = stream;
    //   }
    //   stream.getTracks().forEach((track) => {
    //     peerConnection.addTrack(track, stream);
    //   });
    //   const videoTrack = stream.getVideoTracks()[0];
    //   setActiveVideoTrack(videoTrack);
    //   const audioTrack = stream.getAudioTracks()[0];
    //   setActiveAudioTrack(audioTrack);
    //   setCallType(isIncoming ? "incomingAudio" : "outgoingAudio");
    //   setIsAudioOn(true);
    //   setIsVideoOn(false);
    //   setIsCallOpen(true);
    //   await fetchDevices();
    //   handleSelectAudioDevice(selectedAudioDeviceID, selectedAudioDeviceLabel);
    //   handleSelectVideoDevice(selectedVideoDeviceID, selectedVideoDeviceLabel);
    //   if (!isIncoming) {
    //     broadcastOffer();
    //   }
    // } catch (error) {
    //   console.error("Error starting media: ", error);
    // }
  };
  const handleEndCall = () => {};
  const handleCloseCallDialog = () => setIsCallOpen(false); // TODO: finish implementing this

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
      const chatUsers = chatParticipants.filter(
        (participant: ChatUser) => participant.userId !== info.teacherID
      );
      const chatName = chatUsers
        .map((participant: ChatUser) => participant.preferredName)
        .join(", ");
      handleChatSelect(storedCreatedChatRoomId, chatName, chatUsers);
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

  useEffect(() => {
    if (!isRecording || !analyser || !dataArray || !canvasRef.current) return;

    const canvas = canvasRef.current;
    drawWaveform(analyser, dataArray, canvas);

    return () => {
      if (audioContext && audioContext.state === "running") {
        audioContext.close();
      }
    };
  }, [isRecording, analyser, dataArray]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handleEnded = () => {
        setIsPlayingAudio(false);
        audioElement.currentTime = 0;
      };

      audioElement.addEventListener("ended", handleEnded);

      return () => {
        audioElement?.removeEventListener("ended", handleEnded);
      };
    }
  }, [audioRef.current]);

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
            handleCloseChat={handleChatClose}
            messages={chatMessages}
            messagesAreLoading={areMessagesLoading || isCreatingChatRoom}
            name={name}
            textMessage={textMessage}
            handleTextMessageChange={handleTextMessageChange}
            isImageUploaded={isImageUploaded}
            thumbnailUrl={thumbnailUrl}
            handleClickAttach={handleClickAttach}
            handleRemoveAttachment={handleRemoveAttachment}
            isRecording={isRecording}
            handleStartRecording={handleStartRecording}
            handleStopRecording={handleStopRecording}
            handleDeleteRecording={handleDeleteRecording}
            audioURL={audioURL}
            audioRef={audioRef}
            isPlayingAudio={isPlayingAudio}
            handlePlayAudio={handlePlayAudio}
            handleStopAudio={handleStopAudio}
            canvasRef={canvasRef}
            handleClickSend={handleClickSend}
            handleVideoCall={handleVideoCall}
            handleAudioCall={handleAudioCall}
          />
        </Grid>
      </Grid>
      <ChatDialog
        isStartNewChatOpen={isStartNewChatOpen}
        handleCloseStartNewChat={handleCloseStartNewChat}
        handleStartNewChat={handleStartNewChat}
      />
      <CallDialog
        isCallOpen={isCallOpen}
        callType={callType}
        callSettingsAnchorEl={callSettingsAnchorEl}
        handleOpenCallSettingsMenu={handleOpenCallSettingsMenu}
        handleCloseCallSettingsMenu={handleCloseCallSettingsMenu}
        recipients={recipients}
        isAudioOn={isAudioOn}
        audioDevices={audioDevices}
        selectedAudioDeviceID={selectedAudioDeviceID}
        selectedAudioDeviceLabel={selectedAudioDeviceLabel}
        handleSelectAudioDevice={handleSelectAudioDevice}
        toggleAudio={toggleAudio}
        isVideoOn={isVideoOn}
        videoDevices={videoDevices}
        selectedVideoDeviceID={selectedVideoDeviceID}
        selectedVideoDeviceLabel={selectedVideoDeviceLabel}
        handleSelectVideoDevice={handleSelectVideoDevice}
        toggleVideo={toggleVideo}
        handleEndCall={handleEndCall}
        handleCloseCallDialog={handleCloseCallDialog}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isRemoteStreamActive={isRemoteStreamActive}
      />
      <Dialog
        open={isCallIncomingDialogOpen}
        onClose={() => setIsCallIncomingDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            fontFamily: heavyFont,
            textAlign: "center",
          }}
        >
          Incoming Call
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="column"
            spacing={2}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              mt: 2,
            }}
          >
            <Avatar
              src={incomingCallProfilePictureUrl || ""}
              alt={incomingCallPreferredName || "User"}
            />
            <Text
              variant="body1"
              fontWeight="bold"
              textAlign="center"
              fontFamily={regularFont}
            >
              {incomingCallPreferredName || "User"}
            </Text>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Box>
                <Tooltip title="Reject Call">
                  <IconButton
                    onClick={() => setIsCallIncomingDialogOpen(false)}
                  >
                    <Cancel sx={{ color: "red" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box>
                <Tooltip title="Answer Call">
                  <IconButton
                    onClick={() => {
                      emitAnswerCall({
                        from: incomingCallerId!,
                        to: info.teacherID!,
                        // from: info.teacherID!,
                        // to: incomingCallerId!,
                        answer,
                      });
                      handleVideoCall(true);
                      setIsCallIncomingDialogOpen(false);
                    }}
                  >
                    <Phone sx={{ color: "green" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Chat;
