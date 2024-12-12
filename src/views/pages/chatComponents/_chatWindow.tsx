import React, { FC } from "react";
import { useIntl } from "react-intl";
import { Box, IconButton, Paper, Stack, TextField } from "@mui/material";
import { AttachFileTwoTone, Done, DoneAll, Send } from "@mui/icons-material";

import { useTeacherContext } from "../../../context/teacherContext";
import { useThemeContext } from "../../../context/themeContext";
import { ChatMessage } from "../../../hooks/useChat";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ChatWindowProps {
  selectedChat: string | null;
  messages: ChatMessage[];
  messagesAreLoading: boolean;
  name: string;
  textMessage: string;
  handleTextMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickAttach: () => void;
  handleClickSend: () => void;
}

const ChatWindow: FC<ChatWindowProps> = ({
  selectedChat,
  messages,
  messagesAreLoading,
  name,
  textMessage,
  handleTextMessageChange,
  handleClickAttach,
  handleClickSend,
}) => {
  const intl = useIntl();
  const { theme, regularFont } = useThemeContext();
  const { info } = useTeacherContext();
  const allMessages = messages || [];
  const messagesComponents = messagesAreLoading ? (
    <CircularLoading />
  ) : (
    <>
      {allMessages.map((msg, index) => {
        const date = new Date(msg.timestamp);
        const isUser = msg.sender.userId === info.teacherID!;
        const displayReceived = isUser && !msg.isRead && msg.isReceived;
        // let displayReceived = false;
        // let displayRead = false;
        // if (isUser) {
        //   if (
        //     msg.messageId === "14663aaf-7fb2-4d64-89dc-30e2cb1adcc2" ||
        //     msg.messageId === "8485c6f3-3eeb-4a87-8a72-30840509161a"
        //   ) {
        //     displayReceived = true;
        //     displayRead = false;
        //   } else {
        //     displayReceived = false;
        //     displayRead = true;
        //   }
        // }
        const displayRead = isUser && msg.isRead && msg.isReceived;
        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                msg.sender.userId === info.teacherID
                  ? "flex-end"
                  : "flex-start",
              mb: 1,
              width: "100%",
            }}
          >
            <Paper
              sx={{
                p: 1,
                borderRadius: "6px",
                maxWidth: "50%",
                backgroundColor:
                  msg.sender.userId === info.teacherID
                    ? theme.palette.background.default
                    : theme.palette.primary.light,
              }}
            >
              <Text fontFamily={regularFont}>
                <strong>{msg.sender.preferredName}:</strong> {msg.content}
              </Text>
              <Stack
                direction="row"
                // spacing={0.5}
                sx={{ justifyContent: "space-between" }}
              >
                <Text
                  fontFamily={regularFont}
                  variant="caption"
                  color="textSecondary"
                >
                  {`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
                </Text>
                {displayReceived ? (
                  <Done sx={{ color: "limegreen" }} />
                ) : displayRead ? (
                  <DoneAll sx={{ color: "limegreen" }} />
                ) : isUser ? (
                  <Done sx={{ color: "InactiveCaptionText" }} />
                ) : null}
              </Stack>
            </Paper>
          </Box>
        );
      })}
    </>
  );
  const chatIsSelected = Boolean(selectedChat);
  const sendIsDisabled = !Boolean(selectedChat) || !textMessage;

  return (
    <Box sx={{ pl: 2, pt: 1, pb: 1 }}>
      <Box
        sx={{
          backgroundColor: theme.palette.primary.dark,
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
        }}
      >
        <Text
          variant="h6"
          fontFamily={regularFont}
          fontWeight="bold"
          textAlign="center"
          sx={{ color: theme.palette.primary.contrastText }}
        >
          {name || intl.formatMessage({ id: "chat_recentChats" })}
        </Text>
      </Box>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          height: "74vh",
          overflowY: "auto",
          width: "100%",
          backgroundColor: "#f7f7f7",
          display: messagesAreLoading ? "flex" : "block",
          justifyContent: messagesAreLoading ? "center" : "normal",
          alignContent: messagesAreLoading ? "center" : "normal",
        }}
      >
        {allMessages.length ? (
          messagesComponents
        ) : (
          <Text fontFamily={regularFont} color="textSecondary" align="center">
            {intl.formatMessage({ id: "chat_chatWindowDescription" })}
          </Text>
        )}
      </Paper>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          border: "1px solid #ddd",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          backgroundColor: theme.palette.primary.dark,
        }}
      >
        <IconButton disabled={!chatIsSelected} onClick={handleClickAttach}>
          <AttachFileTwoTone
            sx={{
              color: !chatIsSelected
                ? "InactiveCaptionText"
                : theme.palette.secondary.light,
            }}
          />
        </IconButton>
        <TextField
          variant="outlined"
          fullWidth
          size="small"
          multiline
          maxRows={4}
          label={
            <Text variant="caption" fontFamily={regularFont}>
              {intl.formatMessage({ id: "chat_messagePlaceholder" })}
            </Text>
          }
          sx={{
            ml: 1,
            mr: 1,
            backgroundColor: theme.palette.background.default,
            borderRadius: "6px",
            fontFamily: regularFont,
            color: theme.palette.text.primary,
          }}
          disabled={!chatIsSelected}
          value={textMessage}
          onChange={handleTextMessageChange}
        />
        <IconButton disabled={sendIsDisabled} onClick={() => handleClickSend()}>
          <Send
            sx={{
              color: sendIsDisabled
                ? "InactiveCaptionText"
                : theme.palette.secondary.light,
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWindow;
