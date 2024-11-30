/**
 * THIS FILE IS FOR TESTING PURPOSES ONLY
 */
import { FC } from "react";
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
import { useIntl } from "react-intl";

import { useThemeContext } from "../../../context/themeContext";
import Text from "../../text/text";

interface ControlsProps {
  handleOpenCallSettingsMenu: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleCloseCallSettingsMenu: () => void;
  callSettingsMenuIsOpen: boolean;
  callSettingsAnchorEl: HTMLElement | null;
  videoDevices: MediaDeviceInfo[];
  handleSelectVideoDevice: (deviceId: string, label: string) => void;
  selectedVideoDeviceLabel: string;
  isVideoOn: boolean;
  toggleVideo: () => void;
  audioDevices: MediaDeviceInfo[];
  handleSelectAudioDevice: (deviceId: string, label: string) => void;
  selectedAudioDeviceLabel: string;
  isMicOn: boolean;
  toggleAudio: () => void;
  broadcastOffer: () => void;
}

const Controls: FC<ControlsProps> = ({
  handleOpenCallSettingsMenu,
  handleCloseCallSettingsMenu,
  callSettingsMenuIsOpen,
  callSettingsAnchorEl,
  videoDevices,
  handleSelectVideoDevice,
  selectedVideoDeviceLabel,
  isVideoOn,
  toggleVideo,
  audioDevices,
  handleSelectAudioDevice,
  selectedAudioDeviceLabel,
  isMicOn,
  toggleAudio,
  broadcastOffer,
}) => {
  const intl = useIntl();
  const { theme, regularFont, heavyFont } = useThemeContext();

  return (
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
  );
};

export default Controls;
