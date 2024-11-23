import { FC, useState } from "react";
import { useIntl } from "react-intl";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
} from "@mui/material";

import { useChatContext, Student } from "../../../context/chatContext";
import { useThemeContext } from "../../../context/themeContext";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ChatDialogProps {
  isStartNewChatOpen: boolean;
  handleCloseStartNewChat: () => void;
  handleStartNewChat: (name: string, toID: string) => void;
}

const ChatDialog: FC<ChatDialogProps> = ({
  isStartNewChatOpen,
  handleCloseStartNewChat,
  handleStartNewChat,
}) => {
  const intl = useIntl();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const { studentsAreLoading, fetchAllStudents } = useChatContext();
  const [isStartNewChatAutocompleteOpen, setIsStartNewChatAutocompleteOpen] =
    useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleOpenStartNewChatAutocomplete = async () => {
    setIsStartNewChatAutocompleteOpen(true);
    try {
      const fetchedStudents = await fetchAllStudents();
      setAllStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students: ", error); // TODO: localize
    }
  };
  const handleCloseStartNewChatAutocomplete = () => {
    setIsStartNewChatAutocompleteOpen(false);
    setAllStudents([]);
  };

  return (
    <Dialog open={isStartNewChatOpen} onClose={handleCloseStartNewChat}>
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main }}>
        <Text variant="h6" fontFamily={heavyFont}>
          {intl.formatMessage({ id: "chat_dialogTitle" })}
        </Text>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ minWidth: 450 }}>
        <DialogContentText>
          <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
            {intl.formatMessage({ id: "chat_dialogContent_selectUser" })}
          </Text>
        </DialogContentText>
        <Autocomplete
          sx={{ minWidth: 300 }}
          open={isStartNewChatAutocompleteOpen}
          onOpen={handleOpenStartNewChatAutocomplete}
          onClose={handleCloseStartNewChatAutocomplete}
          value={selectedStudent}
          onChange={(event: any, newValue: Student | null) =>
            setSelectedStudent(newValue)
          }
          isOptionEqualToValue={(option, value) => option === value}
          getOptionLabel={(option: Student) => option.preferredname}
          options={allStudents}
          loading={studentsAreLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                <Text variant="caption" fontFamily={regularFont}>
                  {intl.formatMessage({
                    id: "chat_dialogContent_autosuggestPlaceholder",
                  })}
                </Text>
              }
              variant="outlined"
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {studentsAreLoading ? <CircularLoading /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseStartNewChat}
          variant="outlined"
          color="secondary"
        >
          <Text variant="button" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({ id: "common_cancel" })}
          </Text>
        </Button>
        <Button
          onClick={() =>
            handleStartNewChat(
              selectedStudent?.preferredname!,
              selectedStudent?.studentid!
            )
          }
          variant="contained"
          color="secondary"
          disabled={!selectedStudent}
        >
          <Text variant="button" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({ id: "chat_dialogAction_start" })}
          </Text>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;
