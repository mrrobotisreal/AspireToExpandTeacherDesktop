import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import { useChatContext, Student } from "../../../context/chatContext";
import { useTeacherContext } from "../../../context/teacherContext";
import { useThemeContext } from "../../../context/themeContext";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ClassesProps {
  handleEnterClassroom: () => void;
}

const Classes: FC<ClassesProps> = ({ handleEnterClassroom }) => {
  const intl = useIntl();
  const { studentsAreLoading, fetchAllStudents } = useChatContext();
  const { classes, fetchClasses } = useTeacherContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] =
    useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isSelectStudentAutocompleteOpen, setIsSelectStudentAutocompleteOpen] =
    useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSelectedStudentInvalid, setIsSelectedStudentInvalid] =
    useState<boolean>(true);
  const [studySubject, setStudySubject] = useState<string>("");
  const [isStudySubjectInvalid, setIsStudySubjectInvalid] =
    useState<boolean>(true);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isRoomInvalid, setIsRoomInvalid] = useState<boolean>(true);
  const [selectedDateString, setSelectedDateString] = useState<string>(
    new Date().toLocaleString()
  );
  const [isDateInvalid, setIsDateInvalid] = useState<boolean>(true);

  const handleOpenCreateClassDialog = () => {
    setIsCreateClassDialogOpen(true);
  };
  const handleCloseCreateClassDialog = () => {
    setIsCreateClassDialogOpen(false);
  };

  const handleOpenSelectStudentAutocomplete = async () => {
    setIsSelectStudentAutocompleteOpen(true);
    try {
      const fetchedStudents = await fetchAllStudents();
      setAllStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students: ", error); // TODO: localize
    }
  };
  const handleCloseSelectStudentAutocomplete = () => {
    setIsSelectStudentAutocompleteOpen(false);
    setAllStudents([]);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <Box>
      <Text variant="h4" fontFamily={heavyFont}>
        {intl.formatMessage({ id: "classroom_upcomingClasses" })}
      </Text>
      <List>
        {classes.map((upcomingClass) => (
          <Box key={upcomingClass.studentID}>
            <Tooltip
              title={intl.formatMessage(
                { id: "classroom_upcomingClassTooltip" },
                {
                  student: upcomingClass.preferredName,
                  room: upcomingClass.room,
                }
              )}
            >
              <ListItem onClick={handleEnterClassroom}>
                <ListItemAvatar>
                  <Avatar
                    src={upcomingClass.profilePicURL}
                    alt={upcomingClass.preferredName}
                  />
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{
                    fontFamily: heavyFont,
                  }}
                  primary={upcomingClass.preferredName}
                  secondaryTypographyProps={{
                    fontFamily: regularFont,
                  }}
                  secondary={`${upcomingClass.subject}, Rm. ${upcomingClass.room}, ${new Date(upcomingClass.dateAndTime).toLocaleString()}`}
                />
              </ListItem>
            </Tooltip>
            <Divider />
          </Box>
        ))}
      </List>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 2,
        }}
      >
        <Stack spacing={2} direction="row">
          <Button
            variant="contained"
            sx={{ backgroundColor: theme.palette.secondary.light }}
            onClick={handleOpenCreateClassDialog}
          >
            <Text variant="button" fontFamily={regularFont}>
              {intl.formatMessage({ id: "classroom_createNewClass" })}
            </Text>
          </Button>
        </Stack>
      </Box>
      <Dialog
        open={isCreateClassDialogOpen}
        onClose={handleCloseCreateClassDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          variant="h6"
          sx={{
            backgroundColor: theme.palette.primary.main,
            fontFamily: heavyFont,
          }}
        >
          {intl.formatMessage({ id: "classroom_createNewClass" })}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 2,
              mt: 1,
            }}
          >
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({ id: "classroom_inputStudent" })}:
            </Text>
            <Autocomplete
              sx={{ minWidth: 300 }}
              open={isSelectStudentAutocompleteOpen}
              onOpen={handleOpenSelectStudentAutocomplete}
              onClose={handleCloseSelectStudentAutocomplete}
              value={selectedStudent}
              onChange={(event: any, newValue: Student | null) => {
                setSelectedStudent(newValue);
                if (!newValue) {
                  setIsSelectedStudentInvalid(true);
                } else {
                  setIsSelectedStudentInvalid(false);
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
                  error={isSelectedStudentInvalid}
                  helperText={
                    isSelectedStudentInvalid
                      ? intl.formatMessage({
                          id: "classroom_inputStudentError",
                        })
                      : ""
                  }
                />
              )}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 2,
            }}
          >
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({ id: "classroom_inputSubject" })}:
            </Text>
            <TextField
              fullWidth
              variant="outlined"
              value={studySubject}
              onChange={(event) => {
                setStudySubject(event.target.value);
                if (!event.target.value || event.target.value === "") {
                  setIsStudySubjectInvalid(true);
                } else {
                  setIsStudySubjectInvalid(false);
                }
              }}
              error={isStudySubjectInvalid}
              helperText={
                isStudySubjectInvalid
                  ? intl.formatMessage({ id: "classroom_inputSubjectError" })
                  : ""
              }
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 2,
            }}
          >
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({ id: "classroom_inputDate" })}:
            </Text>
            <DateTimePicker
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              value={dayjs(selectedDateString)}
              onChange={(date: Dayjs | null) => {
                if (date) {
                  const selectedDate = date.toDate();
                  const currentDate = new Date();
                  if (selectedDate <= currentDate) {
                    setIsDateInvalid(true);
                  } else {
                    setIsDateInvalid(false);
                    setSelectedDateString(date.toDate().toLocaleString());
                  }
                } else {
                  setIsDateInvalid(true);
                }
              }}
              disablePast
            />
            {/* Put error helper text here */}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 2,
            }}
          >
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              {intl.formatMessage({ id: "classroom_inputRoom" })}:
            </Text>
            <FormControl variant="outlined" error={isRoomInvalid}>
              <InputLabel htmlFor="room-select">Room</InputLabel>
              <Select
                value={selectedRoom}
                onChange={(event) => {
                  console.log("Room selected: ", event.target.value);
                  setSelectedRoom(event.target.value);
                  if (!event.target.value || event.target.value === "") {
                    setIsRoomInvalid(true);
                  } else {
                    setIsRoomInvalid(false);
                  }
                }}
                label="Room"
                inputProps={{
                  name: "room",
                  id: "room-select",
                }}
                required
              >
                <MenuItem value="">
                  <em>{intl.formatMessage({ id: "common_none" })}</em>
                </MenuItem>
                <MenuItem value="001">001</MenuItem>
                <MenuItem value="002">002</MenuItem>
                <MenuItem value="003">003</MenuItem>
                <MenuItem value="004">004</MenuItem>
                <MenuItem value="005">005</MenuItem>
                <MenuItem value="123">123</MenuItem>
              </Select>
              {isRoomInvalid && (
                <FormHelperText>
                  {intl.formatMessage({ id: "classroom_inputRoomError" })}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCreateClassDialog}
            variant="outlined"
            color="secondary"
          >
            <Text variant="button" fontFamily={regularFont}>
              {intl.formatMessage({ id: "common_cancel" })}
            </Text>
          </Button>
          <Button
            onClick={handleCloseCreateClassDialog}
            variant="contained"
            sx={{ backgroundColor: theme.palette.secondary.light }}
            disabled={
              isSelectedStudentInvalid ||
              isStudySubjectInvalid ||
              isDateInvalid ||
              isRoomInvalid
            }
          >
            <Text variant="button" fontFamily={regularFont}>
              {intl.formatMessage({ id: "common_create" })}
            </Text>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes;
