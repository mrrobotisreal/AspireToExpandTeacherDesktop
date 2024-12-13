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
  Stack,
  TextField,
} from "@mui/material";

import { useChatContext, Student, Teacher } from "../../../context/chatContext";
import { useThemeContext } from "../../../context/themeContext";
import { useTeacherContext } from "../../../context/teacherContext";
import { ChatUser } from "../../../hooks/useChat";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ChatDialogProps {
  isStartNewChatOpen: boolean;
  handleCloseStartNewChat: () => void;
  handleStartNewChat: (users: ChatUser[], message: string) => void;
}

const ChatDialog: FC<ChatDialogProps> = ({
  isStartNewChatOpen,
  handleCloseStartNewChat,
  handleStartNewChat,
}) => {
  const intl = useIntl();
  const { info } = useTeacherContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const {
    studentsAreLoading,
    fetchAllStudents,
    teachersAreLoading,
    listTeachers,
  } = useChatContext();
  const [isStartNewChatAutocompleteOpen, setIsStartNewChatAutocompleteOpen] =
    useState<boolean>(false);
  const [
    isStartNewTeacherChatAutocompleteOpen,
    setIsStartNewTeacherChatAutocompleteOpen,
  ] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);
  const [textMessage, setTextMessage] = useState<string>("");

  const handleOpenStartNewChatAutocomplete = async () => {
    setIsStartNewChatAutocompleteOpen(true);
    try {
      const fetchedStudents = await fetchAllStudents();
      setAllStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students: ", error); // TODO: localize, change to "listStudents" like server
    }
  };
  const handleCloseStartNewChatAutocomplete = () => {
    setIsStartNewChatAutocompleteOpen(false);
    setAllStudents([]);
  };

  const handleOpenStartNewTeacherChatAutocomplete = async () => {
    setIsStartNewTeacherChatAutocompleteOpen(true);
    try {
      const teachersList = await listTeachers(info.teacherID!);
      setAllTeachers(teachersList);
    } catch (error) {
      console.error("Error listing teachers: ", error); // TODO: localize
    }
  };
  const handleCloseStartNewTeacherChatAutocomplete = () => {
    setIsStartNewTeacherChatAutocompleteOpen(false);
    setAllTeachers([]);
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
        <Stack spacing={2} sx={{ mb: 2, mt: 2 }}>
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
            onChange={(event: any, newValue: Student | null) => {
              setSelectedStudent(newValue);
              const isUserAlreadySelected = selectedUsers.some(
                (user: ChatUser) => {
                  return user.userId === newValue?.student_id;
                }
              );
              if (!isUserAlreadySelected && newValue) {
                setSelectedUsers([
                  ...selectedUsers,
                  {
                    userId: newValue.student_id,
                    userType: "student",
                    preferredName: newValue.preferred_name,
                    firstName: newValue.first_name,
                    lastName: newValue.last_name,
                    profilePictureUrl: newValue.profile_picture_url,
                  },
                ]);
              }
            }}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option: Student) => option.preferred_name}
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
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({ id: "chat_dialogContent_selectTeacher" })}
            </Text>
          </DialogContentText>
          <Autocomplete
            sx={{ minWidth: 300 }}
            open={isStartNewTeacherChatAutocompleteOpen}
            onOpen={handleOpenStartNewTeacherChatAutocomplete}
            onClose={handleCloseStartNewTeacherChatAutocomplete}
            value={selectedTeacher}
            onChange={(event: any, newValue: Teacher | null) => {
              setSelectedTeacher(newValue);
              const isUserAlreadySelected = selectedUsers.some(
                (user: ChatUser) => {
                  return user.userId === newValue?.teacherID;
                }
              );
              if (!isUserAlreadySelected && newValue) {
                setSelectedUsers([
                  ...selectedUsers,
                  {
                    userId: newValue.teacherID,
                    userType: "teacher",
                    preferredName: newValue.preferred_name,
                    firstName: newValue.first_name,
                    lastName: newValue.last_name,
                    profilePictureUrl: newValue.profile_picture_url,
                  },
                ]);
              }
            }}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option: Teacher) => option.preferred_name}
            options={allTeachers}
            loading={teachersAreLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  <Text variant="caption" fontFamily={regularFont}>
                    {intl.formatMessage({
                      id: "chat_dialogContent_autosuggestTeacherPlaceholder",
                    })}
                  </Text>
                }
                variant="outlined"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {teachersAreLoading ? <CircularLoading /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({
                id: "chat_dialogContent_enterFirstMessageLabel",
              })}
            </Text>
          </DialogContentText>
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            multiline
            maxRows={4}
            label={intl.formatMessage({
              id: "chat_dialogContent_enterFirstMessagePlaceholder",
            })}
            slotProps={{
              inputLabel: {
                sx: {
                  fontFamily: regularFont,
                },
              },
              input: {
                sx: {
                  fontFamily: regularFont,
                },
              },
            }}
            sx={{
              borderRadius: "6px",
              fontFamily: regularFont,
            }}
            disabled={!selectedStudent && !selectedTeacher}
            value={textMessage}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTextMessage(event.target.value)
            }
          />
        </Stack>
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
          onClick={() => {
            console.log("selectedStudent: ", selectedStudent);
            handleStartNewChat(selectedUsers, textMessage);
          }}
          variant="contained"
          color="secondary"
          disabled={
            (!selectedStudent && !selectedTeacher) || textMessage === ""
          }
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
