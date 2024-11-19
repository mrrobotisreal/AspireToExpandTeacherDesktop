import React, { FC, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
} from "@mui/material";
import { useIntl } from "react-intl";

import { useStudentContext } from "../../context/studentContext";
import { useMessagesContext } from "../../context/messagesContext";
import { useThemeContext } from "../../context/themeContext";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";

const ProfileSettings: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo, updateInfoOnServer } = useStudentContext();
  const { changeLocale } = useMessagesContext();
  const { theme, themeCustom, regularFont, heavyFont } = useThemeContext();
  const [profilePicturePath, setProfilePicturePath] = useState(
    info.profilePicturePath ?? ""
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    info.preferredLanguage ?? "en"
  );
  const [timeZone, setTimeZone] = useState(
    info.timeZone ?? "US Pacific (GMT-8/GMT-7)"
  );
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({ id: "common_settingsSaved_success" })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleChooseImage = async () => {
    const filePath = await window.electronAPI.selectImage();

    console.log("File path: ", `file://${filePath}`);

    if (filePath) {
      setProfilePicturePath(`file://${filePath}`);
    }
  };

  const handlePreferredLanguage = (event: SelectChangeEvent) => {
    setPreferredLanguage(event.target.value as string);
    changeLocale(event.target.value as string);
  };

  const handleUpdateSettingsOnServer = async () => {
    if (!info.emailAddress || info.emailAddress === "") {
      console.error("Email address is required to update settings on server");
      return;
    }

    try {
      await updateInfoOnServer({
        email_address: info.emailAddress,
        preferred_language: preferredLanguage,
        profile_picture_path: profilePicturePath,
        time_zone: timeZone,
      });
    } catch (error) {
      console.error("Error updating settings on server: ", error);
    }
  };

  const handleUpdateSettings = () => {
    updateInfo({
      ...info,
      preferredLanguage,
      profilePicturePath,
      timeZone,
    });
    handleUpdateSettingsOnServer();
    setToastIsOpen(true);
  };

  const handleSetTimeZone = (event: SelectChangeEvent) =>
    setTimeZone(event.target.value as string);

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

  useEffect(() => {
    if (info.profilePicturePath) {
      setProfilePicturePath(info.profilePicturePath);
    }

    if (info.preferredLanguage) {
      setPreferredLanguage(info.preferredLanguage);
    }

    if (info.timeZone) {
      setTimeZone(info.timeZone);
    }
  }, [info]);

  return (
    <Layout title={intl.formatMessage({ id: "common_account" })}>
      <Text variant="h4" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "account_profileSettings" })}
      </Text>
      <Text variant="body1" fontFamily={regularFont} color="textPrimary">
        {intl.formatMessage({ id: "account_profileSettings_description" })}
      </Text>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "account_profileSettings_profilePicture" })}:
      </Text>
      <Avatar
        src={profilePicturePath}
        sx={{
          width: 160,
          height: 160,
        }}
      />
      <br />
      <Button variant="outlined" color="secondary" onClick={handleChooseImage}>
        <Text variant="body1" fontFamily={regularFont} color="textPrimary">
          {intl.formatMessage({ id: "common_chooseImage" })}
        </Text>
      </Button>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "common_preferredLanguage" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select
          id="preferredLanguage"
          value={preferredLanguage}
          onChange={handlePreferredLanguage}
        >
          <MenuItem value="en">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_language_en" })}
            </Text>
          </MenuItem>
          <MenuItem value="uk">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_language_uk" })}
            </Text>
          </MenuItem>
          <MenuItem value="ru">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_language_ru" })}
            </Text>
          </MenuItem>
          <MenuItem value="de">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_language_de" })}
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
        {intl.formatMessage({ id: "common_timeZone" })}:
      </Text>
      <FormControl sx={{ minWidth: 300 }}>
        <Select id="timeZone" value={timeZone} onChange={handleSetTimeZone}>
          <MenuItem value="timeZone_us_pacific">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_us_pacific" })}
            </Text>
          </MenuItem>
          <MenuItem value="timeZone_us_mountain">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_us_mountain" })}
            </Text>
          </MenuItem>
          <MenuItem value="timeZone_us_central">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_us_central" })}
            </Text>
          </MenuItem>
          <MenuItem value="timeZone_us_eastern">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_us_eastern" })}
            </Text>
          </MenuItem>
          <MenuItem value="timeZone_at_vienna">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_at_vienna" })}
            </Text>
          </MenuItem>
          <MenuItem value="timeZone_ua_kyiv">
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "timeZone_ua_kyiv" })}
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

export default ProfileSettings;
