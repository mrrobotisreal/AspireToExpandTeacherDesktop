import { FC } from "react";
import { useIntl } from "react-intl";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

import { useThemeContext } from "../../../context/themeContext";
import Text from "../../text/text";

interface ScreenShareDialogProps {
  handleCloseScreenShareOptions: () => void;
  areScreenShareOptionsOpen: boolean;
  screenShareOptions: Electron.DesktopCapturerSource[];
  handleSelectScreenShareSource: (
    source: Electron.DesktopCapturerSource
  ) => void;
}

const ScreenShareDialog: FC<ScreenShareDialogProps> = ({
  handleCloseScreenShareOptions,
  areScreenShareOptionsOpen,
  screenShareOptions,
  handleSelectScreenShareSource,
}) => {
  const intl = useIntl();
  const { theme, heavyFont } = useThemeContext();

  return (
    <Dialog
      open={areScreenShareOptionsOpen}
      onClose={handleCloseScreenShareOptions}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main }}>
        <Text variant="h6" fontFamily={heavyFont}>
          {intl.formatMessage({ id: "classroom_screenShareDialogTitle" })}
        </Text>
      </DialogTitle>
      <DialogContent>
        <List>
          {screenShareOptions.map((option) => {
            const thumbnail = option.thumbnail.toDataURL();

            return (
              <ListItem
                key={option.id}
                onClick={() => handleSelectScreenShareSource(option)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid black",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  margin: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="square"
                    src={thumbnail}
                    alt={option.name}
                    sx={{ height: 180, width: 384 }}
                  />
                </ListItemAvatar>
                <ListItemText primary={<Text>{option.name}</Text>} />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCloseScreenShareOptions}
        >
          {intl.formatMessage({ id: "common_cancel" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScreenShareDialog;
