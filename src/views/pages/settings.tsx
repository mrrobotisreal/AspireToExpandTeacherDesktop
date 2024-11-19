import React, { FC, useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
} from "@mui/material";
import { useIntl } from "react-intl";

import { AppFontStyle } from "../../constants/fonts";
import { useThemeContext, ThemeMode } from "../../context/themeContext";
import { useStudentContext } from "../../context/studentContext";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";

const Settings: FC = () => {
  const intl = useIntl();
  const {
    theme,
    themeCustom,
    toggleThemeMode,
    changeFontStyle,
    heavyFont,
    regularFont,
  } = useThemeContext();
  const { info, getInfo, updateInfo, updateInfoOnServer } = useStudentContext();
  const [selectedThemeMode, setSelectedThemeMode] = useState<ThemeMode>(
    info.themeMode ?? "light"
  );
  const [selectedFontFamily, setSelectedFontFamily] = useState<AppFontStyle>(
    info.fontStyle ?? "Bauhaus"
  );
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({ id: "common_settingsSaved_success" })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSelectThemeMode = (event: SelectChangeEvent) => {
    const value = event.target.value as ThemeMode; // TODO: handle checking system for mode later
    toggleThemeMode(value);
    setSelectedThemeMode(value);
  };

  const handleSelectFontStyle = (event: SelectChangeEvent) => {
    changeFontStyle(event.target.value as AppFontStyle);
    setSelectedFontFamily(event.target.value as AppFontStyle);
  };

  const handleUpdateSettingsOnServer = async () => {
    if (!info.emailAddress || info.emailAddress === "") {
      console.error("Email address is required to update settings on server"); // TODO: localize
      return;
    }

    try {
      await updateInfoOnServer({
        email_address: info.emailAddress,
        theme_mode: selectedThemeMode,
        font_style: selectedFontFamily,
      });
    } catch (error) {
      console.error("Error updating settings on server: ", error); // TODO: localize
    }
  };

  const handleUpdateSettings = () => {
    updateInfo({
      ...info,
      themeMode: selectedThemeMode,
      fontStyle: selectedFontFamily,
    });
    handleUpdateSettingsOnServer();
    setToastIsOpen(true);
  };

  const handleCloseToast = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setToastIsOpen(false);
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_settingsTitle" })}>
      <Text variant="h4" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "account_appSettings" })}
      </Text>
      <Text variant="body1" fontFamily={regularFont} color="textPrimary">
        {intl.formatMessage({ id: "account_appSettings_description" })}
      </Text>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "account_appSettings_themeMode" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="themeMode"
          value={selectedThemeMode}
          onChange={handleSelectThemeMode}
        >
          <MenuItem value="light">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: "account_appSettings_themeMode_lightTheme",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="dark">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: "account_appSettings_themeMode_darkTheme",
              })}
            </Text>
          </MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "account_appSettings_fontStyle" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="fontStyle"
          value={selectedFontFamily}
          onChange={handleSelectFontStyle}
        >
          <MenuItem value="Bauhaus">
            <Text
              variant="body1"
              fontFamily="Bauhaus-Medium"
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_bauhaus",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Hummingbird">
            <Text variant="body1" fontFamily="Hummingbird" color="textPrimary">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_hummingbird",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="LobsterTwo">
            <Text
              variant="body1"
              fontFamily="LobsterTwo-Regular"
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_lobsterTwo",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="NexaScript">
            <Text
              variant="body1"
              fontFamily="NexaScript-Light"
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_nexaScript",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="NotoSerif">
            <Text variant="body1" fontFamily="NotoSerif" color="textPrimary">
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_notoSerif",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Roboto">
            <Text
              variant="body1"
              fontFamily="Roboto-Regular"
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_roboto",
              })}
            </Text>
          </MenuItem>
          <MenuItem value="Ubuntu">
            <Text
              variant="body1"
              fontFamily="Ubuntu-Regular"
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "account_appSettings_fontStyle_ubuntu",
              })}
            </Text>
          </MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{ backgroundColor: theme.palette.secondary.light }}
          onClick={handleUpdateSettings}
        >
          <Text variant="body1" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({ id: "common_settings_save" })}
          </Text>
        </Button>
      </Box>
      <Toast
        message={toastMessage}
        alertProps={{
          severity: toastSeverity,
          onClose: handleCloseToast,
        }}
        snackbarProps={{
          open: toastIsOpen,
          onClose: handleCloseToast,
        }}
      />
    </Layout>
  );
};

export default Settings;
