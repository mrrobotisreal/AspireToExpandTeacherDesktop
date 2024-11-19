import React, { FC } from "react";
import {
  AppBar,
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import Text from "../text/text";

interface TopNavProps {
  handleDrawerOpen: () => void;
  title: string;
}

const TopNav: FC<TopNavProps> = ({ handleDrawerOpen, title }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { info, removeInfo } = useStudentContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar color="primary" position="fixed">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Text
          variant="h5"
          fontFamily={heavyFont}
          textAlign="center"
          sx={{ flexGrow: 1 }}
          color="textPrimary"
        >
          {title}
        </Text>
        <Avatar
          src={info.profilePicturePath}
          sx={{ ml: "auto" }}
          onClick={handleMenuOpen}
        />
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon color="secondary" />
            </ListItemIcon>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "account_profileSettings" })}
            </Text>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/settings");
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <SettingsIcon color="secondary" />
            </ListItemIcon>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "account_appSettings" })}
            </Text>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              navigate("/");
              removeInfo();
              handleMenuClose();
            }}
            sx={{
              p: 2,
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="secondary" />
            </ListItemIcon>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_logout" })}
            </Text>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
