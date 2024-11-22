import React, { FC, useState, useEffect } from "react";
import { Box, Button, Paper, Stack, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

import { useThemeContext } from "../context/themeContext";
import { useTeacherContext } from "../context/teacherContext";
import { useMessagesContext } from "../context/messagesContext";
import { MAIN_SERVER_URL } from "../constants/urls";
import useEncryption from "../hooks/useEncryption";

import CircularLoading from "./loading/circular";
import Text from "./text/text";

const Login: FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { theme, toggleThemeMode, changeFontStyle, regularFont, heavyFont } =
    useThemeContext();
  const { getInfo, updateInfo, updateInfoOnServer } = useTeacherContext();
  const { changeLocale } = useMessagesContext();
  const { generateKeyPair } = useEncryption();
  const [isLoading, setIsLoading] = useState(false);
  const [teacherID, setTeacherID] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (emailAddress === "" || password === "") {
        console.error("Email address and password are required"); // TODO: localize; add toast
        setIsLoading(false);
        return;
      } else {
        const salt = window.electronAPI.getSalt();
        const hashedPassword = bcrypt.hashSync(password, salt);
        const shortenedHash = hashedPassword.slice(0, 32);
        const response = await fetch(
          `${MAIN_SERVER_URL}/teachers/validate/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({
              teacherID,
              email_address: emailAddress,
              password: shortenedHash,
            }),
          }
        );

        if (response.status === 200) {
          const body = await response.json();

          updateInfo({
            teacherID: body.teacherID,
            firstName: body.first_name,
            preferredName: body.preferred_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            nativeLanguage: body.native_language,
            preferredLanguage: body.preferred_language,
            themeMode: body.theme_mode,
            fontStyle: body.font_style,
            profilePictureURL: body.profile_picture_url,
            profilePicturePath: body.profile_picture_path,
            timeZone: body.time_zone,
          });
          toggleThemeMode(
            !body.theme_mode || body.theme_mode === ""
              ? "light"
              : body.theme_mode
          );
          if (body.preferred_language) {
            changeLocale(body.preferred_language);
          }
          if (body.font_style) {
            changeFontStyle(body.font_style);
          }
          if (body.teacherID) {
            window.electronAPI.connectChatWebSocket(body.teacherID);
          } else {
            console.error(
              "Teacher ID not found in response, cannot connect to chat server!"
            ); // TODO: localize; add toast
          }
          if (!body.public_key) {
            const keyPair = await generateKeyPair();
            if (keyPair) {
              updateInfoOnServer({
                email_address: emailAddress,
                public_key: keyPair.publicKey,
              });
            } else {
              console.error(
                "Error generating key pair, data not being encrypted!"
              ); // TODO: localize; add toast
            }
          }
          navigate("/home");
        } else {
          console.error("Invalid email address, teacher ID, or password!"); // TODO: localize; add toast
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error logging in:", error); // TODO: localize; add toast
      setIsLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    const storedTeacherInfo = getInfo();

    if (storedTeacherInfo) {
      updateInfo(storedTeacherInfo);
      navigate("/home");
    }
  }, []);

  return (
    <Paper
      sx={{
        p: 4,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        borderRadius: "12px",
        minWidth: 400,
        backgroundColor: theme.palette.common.white,
      }}
    >
      <Text
        variant="subtitle1"
        textAlign="center"
        fontFamily={regularFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "welcomeScreen_loginTitle" })}
      </Text>
      <Text
        variant="h4"
        fontFamily={heavyFont}
        textAlign="center"
        color="textPrimary"
      >
        {intl.formatMessage({ id: "appTitle" })}!
      </Text>
      <br />
      <Stack direction="column" alignContent="space-evenly" spacing={4}>
        <div>
          <Text
            variant="body1"
            fontWeight="bold"
            fontFamily={regularFont}
            color="textPrimary"
          >
            {intl.formatMessage({ id: "welcomeScreen_inputTeacherID" })}:
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text
                variant="body1"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "common_teacherID" })}
              </Text>
            }
            value={teacherID}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTeacherID(event.target.value)
            }
            color="secondary"
          />
        </div>
        <div>
          <Text
            variant="body1"
            fontWeight="bold"
            fontFamily={regularFont}
            color="textPrimary"
          >
            {intl.formatMessage({ id: "welcomeScreen_inputEmail" })}:
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text
                variant="body1"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "common_emailAddress" })}
              </Text>
            }
            value={emailAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmailAddress(event.target.value)
            }
            color="secondary"
          />
        </div>
        <div>
          <Text
            variant="body1"
            fontWeight="bold"
            fontFamily={regularFont}
            color="textPrimary"
          >
            {intl.formatMessage({ id: "welcomeScreen_inputPassword" })}:
          </Text>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <Text
                variant="body1"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "common_passwordTitle" })}
              </Text>
            }
            type="password"
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
            color="secondary"
          />
        </div>
      </Stack>
      <br />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          sx={{ minWidth: 120, backgroundColor: theme.palette.secondary.light }}
          onClick={handleLogin}
        >
          {isLoading ? (
            <CircularLoading />
          ) : (
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_login" })}
            </Text>
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;
