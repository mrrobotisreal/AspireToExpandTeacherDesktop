import React, { FC, useState } from "react";
import { Box, Container, CssBaseline, SpeedDial, Toolbar } from "@mui/material";

import { useThemeContext } from "../../context/themeContext";
import TopNav from "../navigation/topNav";
import SideNav from "../navigation/sideNav";
import ChatbotDialog from "../chatbot/chatbot";
import { SmartToy } from "@mui/icons-material";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  isFullscreen?: boolean;
}

const Layout: FC<LayoutProps> = ({ children, title, isFullscreen = false }) => {
  const { theme } = useThemeContext();
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [isChatbotDialogOpen, setIsChatbotDialogOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerIsOpen(true);
  const handleDrawerClose = () => setDrawerIsOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
      }}
    >
      <CssBaseline />
      <TopNav title={title} handleDrawerOpen={handleDrawerOpen} />
      <SideNav
        handleDrawerClose={handleDrawerClose}
        drawerIsOpen={drawerIsOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          paddingTop: isFullscreen ? "0" : "64px",
          bgcolor: theme.palette.common.white,
          position: "relative",
        }}
      >
        <Box
          sx={{
            overflowY: isFullscreen ? "hidden" : "auto",
            height: isFullscreen ? "100vh" : "calc(100vh - 64px)",
            padding: 3,
          }}
        >
          <Container>{children}</Container>
        </Box>
        <SpeedDial
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
          FabProps={{
            sx: {
              bgcolor: theme.palette.secondary.main,
              "&:hover": {
                bgcolor: theme.palette.secondary.dark,
              },
            },
          }}
          icon={<SmartToy />}
          ariaLabel="SpeedDial example"
          onClick={() => setIsChatbotDialogOpen(true)}
        />
      </Box>
      <ChatbotDialog
        isChatbotDialogOpen={isChatbotDialogOpen}
        handleCloseChatbotDialog={() => setIsChatbotDialogOpen(false)}
      />
    </Box>
  );
};

export default Layout;
