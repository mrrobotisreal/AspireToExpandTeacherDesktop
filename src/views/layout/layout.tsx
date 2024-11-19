import React, { FC, useState } from "react";
import { Box, Container, CssBaseline, Toolbar } from "@mui/material";

import { useThemeContext } from "../../context/themeContext";
import TopNav from "../navigation/topNav";
import SideNav from "../navigation/sideNav";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: FC<LayoutProps> = ({ children, title }) => {
  const { theme } = useThemeContext();
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

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
          paddingTop: "64px",
          bgcolor: theme.palette.common.white,
          position: "relative",
        }}
      >
        <Box
          sx={{
            overflowY: "auto",
            height: "calc(100vh - 64px)",
            padding: 3,
          }}
        >
          <Container>{children}</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
