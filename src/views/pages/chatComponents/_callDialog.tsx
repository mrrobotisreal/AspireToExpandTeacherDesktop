import { FC, RefObject, useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Dialog,
  Divider,
  Grid2 as Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
} from "@mui/material";
import {
  CallEnd as CallEndIcon,
  Close as CloseIcon,
  MicTwoTone as MicIcon,
  MicOffTwoTone as MicOffIcon,
  SettingsTwoTone as SettingsIcon,
  VideocamTwoTone as VideoIcon,
  VideocamOffTwoTone as VideoOffIcon,
} from "@mui/icons-material";
import { useIntl } from "react-intl";

import { useTeacherContext } from "../../../context/teacherContext";
import { useThemeContext } from "../../../context/themeContext";
import Text from "../../text/text";
import { CallType, ChatVideoRefObject } from "../_chat";
import { ChatUser } from "../../../hooks/useChat";

interface CallDialogProps {
  isCallOpen: boolean;
  callType: CallType;
  callSettingsAnchorEl: null | HTMLElement;
  handleOpenCallSettingsMenu: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleCloseCallSettingsMenu: () => void;
  recipients: ChatUser[];
  isAudioOn: boolean;
  audioDevices: MediaDeviceInfo[];
  selectedAudioDeviceID: string;
  selectedAudioDeviceLabel: string;
  handleSelectAudioDevice: (deviceId: string, label: string) => void;
  toggleAudio: () => void;
  isVideoOn: boolean;
  videoDevices: MediaDeviceInfo[];
  selectedVideoDeviceID: string;
  selectedVideoDeviceLabel: string;
  handleSelectVideoDevice: (deviceId: string, label: string) => void;
  toggleVideo: () => void;
  handleEndCall: () => void;
  handleCloseCallDialog: () => void;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isRemoteStreamActive: boolean;
}

const CallDialog: FC<CallDialogProps> = ({
  isCallOpen,
  callType,
  callSettingsAnchorEl,
  handleOpenCallSettingsMenu,
  handleCloseCallSettingsMenu,
  recipients,
  isAudioOn,
  audioDevices,
  selectedAudioDeviceID,
  selectedAudioDeviceLabel,
  handleSelectAudioDevice,
  toggleAudio,
  isVideoOn,
  videoDevices,
  selectedVideoDeviceID,
  selectedVideoDeviceLabel,
  handleSelectVideoDevice,
  toggleVideo,
  handleEndCall,
  handleCloseCallDialog,
  localVideoRef,
  remoteVideoRef,
  isRemoteStreamActive,
}) => {
  const intl = useIntl();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const { info } = useTeacherContext();

  // useEffect(() => {
  //   if (callType === "incomingVideo" || callType === "outgoingVideo") {
  //     handleSelectVideoDevice(selectedVideoDeviceID, selectedVideoDeviceLabel);
  //   } else {
  //     handleSelectAudioDevice(selectedAudioDeviceID, selectedAudioDeviceLabel);
  //   }
  // }, [audioDevices, videoDevices]);

  return (
    <Dialog fullScreen open={isCallOpen} onClose={handleCloseCallDialog}>
      <AppBar
        position="relative"
        sx={{ backgroundColor: theme.palette.primary.dark }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCloseCallDialog}
          >
            <CloseIcon sx={{ color: theme.palette.secondary.light }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {callType === "incomingAudio" ||
          (callType === "outgoingAudio" && (
            <>
              <Avatar
                src={recipients[0]?.profilePictureUrl || ""}
                alt={recipients[0]?.preferredName || "User"}
              />
              <Text variant="h5" fontWeight="bold" color="textPrimary">
                {recipients[0]?.preferredName || "User"}
              </Text>
            </>
          ))}
        {callType === "incomingVideo" ||
          (callType === "outgoingVideo" && (
            <Box
              sx={{
                position: "relative",
                width: "100vw",
                height: "100%",
                // zIndex: isFullscreen ? 9999 : "auto",
                bottom: "auto",
                left: "auto",
                overflow: "hidden",
                visibility: "visible",
              }}
            >
              <Tooltip title={recipients[0]?.preferredName}>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    // height: isFullscreen ? "100vh" : "76vh",
                    height: "100%",
                    width: "100vw",
                    border: "1px solid black",
                    // borderRadius: isFullscreen ? "0" : "6px",
                    borderRadius: "0",
                    visibility: isRemoteStreamActive ? "visible" : "hidden",
                    objectFit: "cover",
                    backgroundImage:
                      "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
                  }}
                />
              </Tooltip>
              <Tooltip title={info.preferredName!}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    position: "absolute",
                    bottom: isRemoteStreamActive ? "10px" : "50%",
                    right: isRemoteStreamActive ? "10px" : "50%",
                    transform: isRemoteStreamActive
                      ? "translate(0, 0)"
                      : "translate(50%, 50%)",
                    height: isRemoteStreamActive ? "100px" : "100%",
                    width: isRemoteStreamActive ? "150px" : "100%",
                    border: isRemoteStreamActive
                      ? "2px solid white"
                      : "1px solid black",
                    borderRadius: isRemoteStreamActive ? "6px" : "0",
                    // borderRadius: isFullscreen
                    //   ? isRemoteStreamActive
                    //     ? "6px"
                    //     : "0"
                    //   : "6px",
                    boxShadow: isRemoteStreamActive
                      ? "0px 4px 6px rgba(0, 0, 0, 0.3)"
                      : "none",
                    transition: "all 0.3s ease-in-out",
                    objectFit: "cover",
                    backgroundImage:
                      "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
                  }}
                />
              </Tooltip>
            </Box>
          ))}
      </Box>
      <BottomNavigation sx={{ backgroundColor: theme.palette.primary.dark }}>
        <BottomNavigationAction
          label="Call Settings"
          onClick={handleOpenCallSettingsMenu}
          icon={<SettingsIcon sx={{ color: theme.palette.secondary.light }} />}
        />
        <BottomNavigationAction
          label="Mute Audio"
          onClick={toggleAudio}
          icon={
            isAudioOn ? (
              <MicIcon sx={{ color: theme.palette.secondary.light }} />
            ) : (
              <MicOffIcon sx={{ color: theme.palette.secondary.light }} />
            )
          }
        />
        <BottomNavigationAction
          label="Mute Video"
          onClick={toggleVideo}
          icon={
            isVideoOn ? (
              <VideoIcon sx={{ color: theme.palette.secondary.light }} />
            ) : (
              <VideoOffIcon sx={{ color: theme.palette.secondary.light }} />
            )
          }
        />
        <BottomNavigationAction
          label="End Call"
          onClick={handleEndCall}
          icon={<CallEndIcon sx={{ color: "#ff0000" }} />}
        />
      </BottomNavigation>
      <Menu
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorEl={callSettingsAnchorEl}
        open={Boolean(callSettingsAnchorEl)}
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
            {intl.formatMessage({ id: "common_video" })}
          </Text>
          {videoDevices.map((device) => (
            <MenuItem
              key={device.label}
              onClick={() => {
                handleSelectVideoDevice(device.deviceId, device.label);
                handleCloseCallSettingsMenu();
              }}
            >
              <Text
                variant="body2"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {device.label === selectedVideoDeviceLabel
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
            {intl.formatMessage({ id: "common_audio" })}
          </Text>
          {audioDevices.map((device) => (
            <MenuItem
              key={device.label}
              onClick={() => {
                handleSelectAudioDevice(device.deviceId, device.label);
                handleCloseCallSettingsMenu();
              }}
            >
              <Text
                variant="body2"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {device.label === selectedAudioDeviceLabel
                  ? `✅ ${device.label}`
                  : device.label}
              </Text>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Dialog>
  );
};

export default CallDialog;
