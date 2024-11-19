import React, { FC } from "react";
import { useIntl } from "react-intl";
import { Box, IconButton, Paper, TextField } from "@mui/material";
import { AttachFileTwoTone, Send } from "@mui/icons-material";

import { ChatMessage } from "../../../context/chatContext";
import { useStudentContext } from "../../../context/studentContext";
import { useThemeContext } from "../../../context/themeContext";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ChatWindowProps {
  selectedChat: string | null;
  messages: ChatMessage[];
  messagesAreLoading: boolean;
  name: string;
  toID: string;
  textMessage: string;
  handleTextMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickAttach: () => void;
  handleClickSend: (name: string, toID: string) => void;
}

const ChatWindow: FC<ChatWindowProps> = ({
  selectedChat,
  messages,
  messagesAreLoading,
  name,
  toID,
  textMessage,
  handleTextMessageChange,
  handleClickAttach,
  handleClickSend,
}) => {
  const intl = useIntl();
  const { theme, regularFont } = useThemeContext();
  const { info } = useStudentContext();
  const messagesComponents = messagesAreLoading ? (
    <CircularLoading />
  ) : (
    <>
      {messages.map((msg, index) => {
        const date = new Date(msg.time);
        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                msg.from === info.preferredName! ? "flex-end" : "flex-start",
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
                  msg.from === info.preferredName!
                    ? theme.palette.background.default
                    : theme.palette.primary.light,
              }}
            >
              <Text fontFamily={regularFont}>
                <strong>{msg.from}:</strong> {msg.content}
              </Text>
              <Text
                fontFamily={regularFont}
                variant="caption"
                color="textSecondary"
              >
                {`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
              </Text>
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
          backgroundColor: theme.palette.primary.main,
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
        }}
      >
        <Text
          variant="h6"
          fontFamily={regularFont}
          fontWeight="bold"
          textAlign="center"
        >
          {intl.formatMessage({ id: "chat_recentChats" })}
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
        {messages.length ? (
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
          <AttachFileTwoTone sx={{ color: theme.palette.secondary.light }} />
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
        <IconButton
          disabled={sendIsDisabled}
          onClick={() => handleClickSend(name, toID)}
        >
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
