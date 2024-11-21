import React, { FC, useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  MicOffTwoTone,
  MicTwoTone,
  SettingsTwoTone,
  VideocamOffTwoTone,
  VideocamTwoTone,
} from "@mui/icons-material";

import { useTeacherContext } from "../../context/teacherContext";
import { useThemeContext } from "../../context/themeContext";
import useClassroomSocket from "../../hooks/useClassroomSocket";
import Layout from "../layout/layout";
import Text from "../text/text";

const url = `ws://localhost:9999/?type=teacher&room=123`;

const Classroom: FC = () => {
  const intl = useIntl();
  const { getInfo, updateInfo } = useTeacherContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const { sendMessage, peerConnection } = useClassroomSocket({
    url,
  });
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage(JSON.stringify({ type: "candidate", data: event.candidate }));
    }
  };
  peerConnection.ontrack = (event) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaStreamTrack[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("Default");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaStreamTrack[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("Default");
  const [callSettingsAnchorEl, setCallSettingsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [callSettingsMenuIsOpen, setCallSettingsMenuIsOpen] = useState(false);

  const handleOpenCallSettingsMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setCallSettingsAnchorEl(event.currentTarget);
    setCallSettingsMenuIsOpen(true);
  };
  const handleCloseCallSettingsMenu = () => {
    setCallSettingsMenuIsOpen(false);
    setCallSettingsAnchorEl(null);
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };
  const toggleAudio = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const audioStreamDevices: MediaStreamTrack[] = stream.getAudioTracks();
      const videoStreamDevices: MediaStreamTrack[] = stream.getVideoTracks();
      setAudioDevices(audioStreamDevices);
      setSelectedAudioDevice(audioStreamDevices[0].label);
      setVideoDevices(videoStreamDevices);
      setSelectedVideoDevice(videoStreamDevices[0].label);
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
      setIsMicOn(true);
      setIsVideoOn(true);
    } catch (error) {
      console.error("Error starting media: ", error);
    }
  };

  useEffect(() => {
    startMedia();
  }, []);

  async function broadcastOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendMessage(JSON.stringify({ type: "offer", data: offer }));
  }

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_classroom" })}>
      <Tooltip title="Student's video" placement="top" arrow>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundImage:
              "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
          }}
        />
      </Tooltip>
      <Tooltip title="Your local video" placement="bottom" arrow>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          style={{
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundImage:
              "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
          }}
        />
      </Tooltip>
      <Box padding={2}>
        <Stack direction="row" justifyContent="space-evenly">
          <IconButton
            id="call-settings-button"
            onClick={handleOpenCallSettingsMenu}
            size="large"
          >
            <SettingsTwoTone
              fontSize="large"
              sx={{ color: theme.palette.secondary.light }}
            />
          </IconButton>
          <Menu
            id="call-settings-menu"
            elevation={1}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            anchorEl={callSettingsAnchorEl}
            open={callSettingsMenuIsOpen}
            onClose={handleCloseCallSettingsMenu}
          >
            <Box padding={2}>
              <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
                {intl.formatMessage({ id: "classroom_callSettings" })}
              </Text>
              <Divider sx={{ my: 0.5 }} />
              <Text
                variant="body1"
                fontFamily={regularFont}
                fontWeight="bold"
                color="textPrimary"
              >
                Video
              </Text>
              {videoDevices.map((device) => (
                <MenuItem key={device.label}>
                  <Text
                    variant="body2"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {device.label === selectedVideoDevice
                      ? `✅ ${device.label}`
                      : device.label}
                  </Text>
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5 }} />
              <Text
                variant="body1"
                fontFamily={regularFont}
                fontWeight="bold"
                color="textPrimary"
              >
                Audio
              </Text>
              {audioDevices.map((device) => (
                <MenuItem key={device.label}>
                  <Text
                    variant="body2"
                    fontFamily={regularFont}
                    color="textPrimary"
                  >
                    {device.label === selectedAudioDevice
                      ? `✅ ${device.label}`
                      : device.label}
                  </Text>
                </MenuItem>
              ))}
            </Box>
          </Menu>
          <Tooltip title={selectedAudioDevice} placement="top" arrow>
            <IconButton size="large" onClick={toggleAudio}>
              {isMicOn ? (
                <MicTwoTone
                  fontSize="large"
                  sx={{ color: theme.palette.secondary.light }}
                />
              ) : (
                <MicOffTwoTone fontSize="large" color="disabled" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={selectedVideoDevice} placement="top" arrow>
            <IconButton size="large" onClick={toggleVideo}>
              {isVideoOn ? (
                <VideocamTwoTone
                  fontSize="large"
                  sx={{ color: theme.palette.secondary.light }}
                />
              ) : (
                <VideocamOffTwoTone fontSize="large" color="disabled" />
              )}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.secondary.light }}
            onClick={broadcastOffer}
          >
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "classroom_startCall" })}
            </Text>
          </Button>
        </Stack>
      </Box>
    </Layout>
  );
};

export default Classroom;
