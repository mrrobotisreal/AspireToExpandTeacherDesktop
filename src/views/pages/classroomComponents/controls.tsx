import { FC } from "react";
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
  ExitToAppTwoTone,
  FullscreenExitTwoTone,
  FullscreenTwoTone,
  MicOffTwoTone,
  MicTwoTone,
  ScreenShareTwoTone,
  SettingsTwoTone,
  StopScreenShareTwoTone,
  VideocamOffTwoTone,
  VideocamTwoTone,
} from "@mui/icons-material";

import { useThemeContext } from "../../../context/themeContext";
import Text from "../../text/text";

interface ControlsProps {
  isInClassroom: boolean;
  handleExitClassroom: () => void;
  isCallStarted: boolean;
  handleOpenCallSettingsMenu: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleCloseCallSettingsMenu: () => void;
  callSettingsAnchorEl: null | HTMLElement;
  callSettingsMenuIsOpen: boolean;
  handleSelectVideoDevice: (deviceId: string, label: string) => void;
  toggleVideo: () => void;
  isVideoOn: boolean;
  videoDevices: { deviceId: string; label: string }[];
  selectedVideoDeviceLabel: string;
  handleSelectAudioDevice: (deviceId: string, label: string) => void;
  toggleAudio: () => void;
  isMicOn: boolean;
  audioDevices: { deviceId: string; label: string }[];
  selectedAudioDeviceLabel: string;
  handleOpenScreenShareOptions: () => void;
  isSharingScreen: boolean;
  broadcastOffer: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const Controls: FC<ControlsProps> = ({
  isInClassroom,
  handleExitClassroom,
  isCallStarted,
  handleOpenCallSettingsMenu,
  handleCloseCallSettingsMenu,
  callSettingsAnchorEl,
  callSettingsMenuIsOpen,
  handleSelectVideoDevice,
  toggleVideo,
  isVideoOn,
  videoDevices,
  selectedVideoDeviceLabel,
  handleSelectAudioDevice,
  toggleAudio,
  isMicOn,
  audioDevices,
  selectedAudioDeviceLabel,
  handleOpenScreenShareOptions,
  isSharingScreen,
  broadcastOffer,
  isFullscreen,
  toggleFullscreen,
}) => {
  const intl = useIntl();
  const { theme, regularFont, heavyFont } = useThemeContext();

  if (!isInClassroom) return null;

  return (
    <Box
      padding={2}
      sx={{
        position: isFullscreen ? "absolute" : "auto",
        bottom: "10px",
        left: isFullscreen ? "35%" : "auto",
        display: "flex",
        justifyContent: "center",
        zIndex: 99999,
        backgroundColor: theme.palette.background.default,
        borderRadius: "6px",
        overflow: "hidden",
        transition: "bottom 0.3s ease",
      }}
    >
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
              {intl.formatMessage({ id: "common_video" })}
            </Text>
            {videoDevices.map((device) => (
              <MenuItem
                key={device.label}
                onClick={() =>
                  handleSelectVideoDevice(device.deviceId, device.label)
                }
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
                onClick={() =>
                  handleSelectAudioDevice(device.deviceId, device.label)
                }
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
        <Tooltip title={selectedAudioDeviceLabel} placement="top" arrow>
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
        <Tooltip title={selectedVideoDeviceLabel} placement="top" arrow>
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
        <Tooltip title="Share screen" placement="top" arrow>
          <IconButton size="large" onClick={handleOpenScreenShareOptions}>
            {isSharingScreen ? (
              <StopScreenShareTwoTone
                fontSize="large"
                sx={{ color: theme.palette.secondary.light }}
              />
            ) : (
              <ScreenShareTwoTone
                fontSize="large"
                sx={{ color: theme.palette.secondary.light }}
              />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          placement="top"
          arrow
        >
          <IconButton size="large" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <FullscreenExitTwoTone
                fontSize="large"
                sx={{ color: theme.palette.secondary.light }}
              />
            ) : (
              <FullscreenTwoTone
                fontSize="large"
                sx={{ color: theme.palette.secondary.light }}
              />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Exit classroom" placement="top" arrow>
          <IconButton size="large" onClick={handleExitClassroom}>
            <ExitToAppTwoTone
              fontSize="large"
              sx={{ color: theme.palette.secondary.light }}
            />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          sx={{ backgroundColor: theme.palette.secondary.light }}
          onClick={broadcastOffer}
        >
          <Text variant="button" fontFamily={regularFont} color="textPrimary">
            {isCallStarted
              ? intl.formatMessage({ id: "classroom_endCall" })
              : intl.formatMessage({ id: "classroom_startCall" })}
          </Text>
        </Button>
      </Stack>
    </Box>
  );
};

export default Controls;
