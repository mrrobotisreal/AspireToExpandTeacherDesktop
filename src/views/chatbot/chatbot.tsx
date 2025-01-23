import { FC, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import OpenAI from "openai";

import { useThemeContext } from "../../context/themeContext";
import Text from "../text/text";
import { OPENAI_API_KEY } from "../../constants/urls";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface ChatbotDialogProps {
  isChatbotDialogOpen: boolean;
  handleCloseChatbotDialog: () => void;
}

const ChatbotDialog: FC<ChatbotDialogProps> = ({
  isChatbotDialogOpen,
  handleCloseChatbotDialog,
}) => {
  const { theme, heavyFont, regularFont } = useThemeContext();
  const [textInput, setTextInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      text: "Hello! I'm Abby, your personal assistant. How can I help you today?",
      user: "system",
    },
  ]);
  const [messages, setMessages] = useState<
    OpenAI.Chat.ChatCompletionMessageParam[]
  >([
    {
      role: "developer",
      content:
        "You are a helpful assistant named Abby and your role is to assist students with their questions regarding the language they are learning. By default, you can assume they are learning English and their native language is either Ukrainian or Russian.",
    },
  ]);

  const handlePrompt = async () => {
    if (textInput === "") return;
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      {
        text: textInput,
        user: "user",
      },
    ]);
    const prompt: OpenAI.Chat.ChatCompletionMessageParam = {
      role: "user",
      content: textInput,
    };
    setMessages((prevMessages) => [...prevMessages, prompt]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...messages,
        {
          role: "user",
          content: textInput,
        },
      ],
      stream: true,
    });
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      {
        text: "thinking...",
        user: "system",
      },
    ]);
    let responseText = "";

    for await (const chunk of completion) {
      if (
        !chunk.choices[0].delta.content ||
        chunk.choices[0].delta.content === "" ||
        chunk.choices[0].delta.content === undefined
      ) {
        continue;
      }
      responseText = responseText + chunk.choices[0].delta.content;
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory.slice(0, -1),
        {
          text: responseText,
          user: "system",
        },
      ]);
    }
    const response: OpenAI.Chat.ChatCompletionMessageParam = {
      role: "assistant",
      content: responseText,
    };
    setMessages((prevMessages) => [...prevMessages, response]);

    setTextInput("");
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={isChatbotDialogOpen}
      onClose={handleCloseChatbotDialog}
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.primary.main,
          textAlign: "center",
        }}
        fontFamily={heavyFont}
      >
        Abby
      </DialogTitle>
      <Box sx={{ padding: 2 }}>
        <Stack direction="column" spacing={2}>
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {chatHistory.map((chat, index) => {
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      chat.user === "user" ? "flex-end" : "flex-start",
                    mb: 1,
                    width: "100%",
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      borderRadius: "6px",
                      maxWidth: "75%",
                      backgroundColor:
                        chat.user === "user"
                          ? theme.palette.background.default
                          : theme.palette.primary.light,
                    }}
                  >
                    <Text variant="body1" fontFamily={regularFont}>
                      {chat.text}
                    </Text>
                  </Paper>
                </Box>
              );
            })}
          </Box>
          <Box>
            <Stack direction="row" spacing={2}>
              <TextField
                variant="outlined"
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                multiline
                maxRows={6}
                sx={{
                  flexGrow: 1,
                  backgroundColor: theme.palette.common.white,
                  width: "100%",
                }}
              />
              <IconButton onClick={handlePrompt}>
                <SendIcon sx={{ color: theme.palette.secondary.light }} />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default ChatbotDialog;
