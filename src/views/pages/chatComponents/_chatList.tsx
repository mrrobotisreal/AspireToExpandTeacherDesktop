import { FC } from "react";
import { useIntl } from "react-intl";
import {
  // Avatar, TODO: implement avatar once images are stored on the server
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AddCircle,
  FindInPage,
  MarkChatReadTwoTone,
  MarkChatUnreadTwoTone,
} from "@mui/icons-material";

import { useTeacherContext } from "../../../context/teacherContext";
import { useThemeContext } from "../../../context/themeContext";
import { ChatSummary } from "../../../hooks/useChat";
import CircularLoading from "../../loading/circular";
import Text from "../../text/text";

interface ChatListProps {
  chats: ChatSummary[];
  chatsAreLoading: boolean;
  onChatSelect: (chatId: string, chatName: string) => void;
  selectedChat: string | null;
  handleStartNewChat: () => void;
}

const ChatList: FC<ChatListProps> = ({
  chats,
  chatsAreLoading,
  onChatSelect,
  selectedChat,
  handleStartNewChat,
}) => {
  const intl = useIntl();
  const { info, getInfo } = useTeacherContext();
  const { theme, themeCustom, regularFont } = useThemeContext();

  return (
    <Box
      sx={{
        pt: 1,
        pb: 1,
        position: "relative",
        height: "80vh",
        maxHeight: "80vh",
      }}
    >
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
          {intl.formatMessage({ id: "chat_recentChats" })}
        </Text>
      </Box>
      <Divider />
      <Box
        sx={{
          overflowY: "auto",
          maxHeight: "74vh",
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${themeCustom.palette.border.main}`,
          borderLeft: `1px solid ${themeCustom.palette.border.main}`,
          height: "74vh",
          display:
            chatsAreLoading || (!chatsAreLoading && !chats?.length)
              ? "flex"
              : "block",
          justifyContent:
            chatsAreLoading || (!chatsAreLoading && !chats?.length)
              ? "center"
              : "normal",
          alignContent:
            chatsAreLoading || (!chatsAreLoading && !chats?.length)
              ? "center"
              : "normal",
        }}
      >
        {chatsAreLoading && <CircularLoading />}
        {!chatsAreLoading && !chats?.length && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              alignSelf: "center",
              height: "100%",
              padding: 2,
            }}
          >
            <Text
              variant="body1"
              fontFamily={regularFont}
              color="textSecondary"
              textAlign="center"
              flexWrap="wrap"
            >
              {intl.formatMessage({ id: "chat_noChatsAvailable" })}
            </Text>
          </Box>
        )}
        {!chatsAreLoading && (
          <List>
            {chats?.map((chat) => {
              const chatName = chat.participants
                .filter((participant) => participant.userId !== info.teacherID)
                .map((participant) => participant.preferredName)
                .join(", ");
              return (
                <Box key={chat.chatId}>
                  <ListItemButton
                    selected={selectedChat === chat.chatId}
                    onClick={() => onChatSelect(chat.chatId, chatName)}
                  >
                    <ListItemText
                      primaryTypographyProps={{
                        fontFamily: regularFont,
                        fontWeight: "bold",
                        textOverflow: "ellipsis",
                        noWrap: true,
                      }}
                      primary={chatName}
                      secondaryTypographyProps={{
                        fontFamily: regularFont,
                        textOverflow: "ellipsis",
                        noWrap: true,
                      }}
                      secondary={chat.latestMessage.content}
                    />
                  </ListItemButton>
                  <Stack direction="row">
                    <Text
                      variant="caption"
                      fontFamily={regularFont}
                      sx={{ ml: 2 }}
                    >
                      {new Date(chat.latestMessage.timestamp).toLocaleString()}
                    </Text>
                    <Box sx={{ flexGrow: 1 }} />
                    {chat.latestMessage.sender.userId !== info.teacherID && (
                      <Box sx={{ mr: 2 }}>
                        {!chat.latestMessage.isRead ? (
                          <MarkChatUnreadTwoTone sx={{ color: "red" }} />
                        ) : (
                          <MarkChatReadTwoTone sx={{ color: "limegreen" }} />
                        )}
                      </Box>
                    )}
                  </Stack>
                  <Divider />
                </Box>
              );
            })}
          </List>
        )}
      </Box>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "space-evenly",
          border: "1px solid #ddd",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          backgroundColor: theme.palette.primary.dark,
        }}
      >
        <Tooltip title="Search chats" placement="top" arrow>
          <IconButton>
            <FindInPage
              sx={{
                color:
                  chatsAreLoading || (!chatsAreLoading && !chats.length)
                    ? "InactiveCaptionText"
                    : theme.palette.secondary.light,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Create new chat" placement="top" arrow>
          <IconButton onClick={handleStartNewChat}>
            <AddCircle sx={{ color: theme.palette.secondary.light }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatList;
