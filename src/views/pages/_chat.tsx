import React, { FC, useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useTeacherContext } from "../../context/teacherContext";
import { useThemeContext } from "../../context/themeContext";
import { useChatContext } from "../../context/chatContext";
import useChat, {
  ChatUser,
  EmitCreateChatRoomParams,
  EmitSendMessageParams,
} from "../../hooks/useChat";
import useUploadImage from "../../hooks/useUploadImage";
import useUploadAudio from "../../hooks/useUploadAudio";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/_chatDialog";
import ChatList from "./chatComponents/_chatList";
import ChatWindow from "./chatComponents/_chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  const { theme } = useThemeContext();
  const { uploadChatImage } = useUploadImage();
  const { uploadAudioMessage } = useUploadAudio();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
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
  } = useChat();
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

  const handleChatSelect = (chatId: string, chatName: string) => {
    localStorage.setItem("selectedChat", chatId);
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
