import { FC, useState } from "react";
import { useIntl } from "react-intl";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
} from "@mui/material";

import { useChatContext, Student, Teacher } from "../../../context/chatContext";
import { useThemeContext } from "../../../context/themeContext";
import { useTeacherContext } from "../../../context/teacherContext";
import { ChatSummary, ChatUser } from "../../../hooks/useChat";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface SearchDialogProps {
  isSearchDialogOpen: boolean;
  handleCloseSearchDialog: () => void;
}

const SearchDialog: FC<SearchDialogProps> = ({
  isSearchDialogOpen,
  handleCloseSearchDialog,
}) => {
  const intl = useIntl();
  const { theme, heavyFont, regularFont } = useThemeContext();
  const [chatMessageAreLoading, setChatMessageAreLoading] =
    useState<boolean>(false);
  const [chatMessageResults, setChatMessageResults] = useState<ChatSummary[]>(
    []
  );

  return (
    <Dialog open={isSearchDialogOpen} onClose={handleCloseSearchDialog}>
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main }}>
        <Text variant="h6" fontFamily={heavyFont}>
          {/* {intl.formatMessage({ id: "chat_searchDialogTitle" })} */}
          Search
        </Text>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack direction="column" spacing={2}>
          <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
            {/* {intl.formatMessage({ id: "chat_searchDialogDescription" })} */}
            Search all chats
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text variant="body1" fontFamily={regularFont}>
                {/* {intl.formatMessage({ id: "chat_searchDialogSearchField" })} */}
                Search
              </Text>
            }
          />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {chatMessageAreLoading && (
              <Box
                sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}
              >
                <CircularLoading />
              </Box>
            )}
            {!chatMessageAreLoading && (
              <List>
                {chatMessageResults.map((chat, index) => {
                  return (
                    <Box key={chat.chatId}>Blah blah, you found some text!</Box>
                  );
                })}
              </List>
              // <Stack direction="column" spacing={2}>
              //   {chatMessageResults.map((chat, index) => {
              //     return ();
              //   })}
              // </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
