import React, { FC, useState, useEffect } from "react";
import { Button, FormHelperText, Paper, Stack, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

import { useThemeContext } from "../context/themeContext";
import { useStudentContext } from "../context/studentContext";
import { useMessagesContext } from "../context/messagesContext";
import { MAIN_SERVER_URL } from "../constants/urls";

import CircularLoading from "./loading/circular";
import Text from "./text/text";

const Login: FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    theme,
    toggleThemeMode,
    changeFontStyle,
    lightFont,
    regularFont,
    heavyFont,
  } = useThemeContext();
  const { getInfo, updateInfo } = useStudentContext();
  const { changeLocale } = useMessagesContext();
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = async () => {
    setIsLoading(true);
    try {
      if (registrationCode === "") {
        console.error("Registration code is required"); // TODO: localize; add toast
        setIsLoading(false);
        return;
      } else {
        const response = await fetch(
          `${MAIN_SERVER_URL}/validate/registration`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ registration_code: registrationCode }),
          }
        );

        if (response.status === 200) {
          const body = await response.json();
          updateInfo({
            firstName: body.first_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            themeMode: "light",
            fontStyle: "Bauhaus",
          });
          navigate("/student-form", {
            state: {
              firstName: body.first_name,
              lastName: body.last_name,
              email: body.email_address,
            },
          });
        } else {
          console.error("Registration code is invalid!"); // TODO: localize; add toast
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error registering user:", error); // TODO: localize; add toast
      setIsLoading(false);
      throw error;
    }
  };

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
        const response = await fetch(`${MAIN_SERVER_URL}/validate/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=UTF-8" },
          body: JSON.stringify({
            email_address: emailAddress,
            password: shortenedHash,
          }),
        });

        if (response.status === 200) {
          const body = await response.json();

          updateInfo({
            studentId: body.student_id,
            firstName: body.first_name,
            preferredName: body.preferred_name,
            lastName: body.last_name,
            emailAddress: body.email_address,
            nativeLanguage: body.native_language,
            preferredLanguage: body.preferred_language,
            themeMode: body.theme_mode,
            fontStyle: body.font_style,
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
          if (body.student_id) {
            window.electronAPI.connectChatWebSocket(body.student_id);
          } else {
            console.error(
              "Student ID not found in response, cannot connect to chat server!"
            ); // TODO: localize; add toast
          }
          navigate("/home");
        } else {
          console.error("Invalid email address or password!"); // TODO: localize; add toast
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
    const storedStudentInfo = getInfo();

    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
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
        {intl.formatMessage({
          id: isLoginVisible
            ? "welcomeScreen_loginTitle"
            : "welcomeScreen_welcomeTitle",
        })}
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
      {isLoginVisible ? (
        <Stack direction="column" alignContent="space-evenly" spacing={4}>
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
              color="primary"
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
              color="primary"
            />
          </div>
        </Stack>
      ) : (
        <>
          <Text
            variant="body1"
            fontWeight="bold"
            fontFamily={regularFont}
            color="textPrimary"
          >
            {intl.formatMessage({ id: "registrationCodeInputLabel" })}:
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
                {intl.formatMessage({ id: "registrationCodeInputHint" })}
              </Text>
            }
            value={registrationCode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setRegistrationCode(event.target.value)
            }
            color="primary"
          />
          <FormHelperText>
            <Text
              variant="caption"
              fontFamily={lightFont}
              color="textSecondary"
            >
              {intl.formatMessage({ id: "registrationCodeInputHelperText" })}
            </Text>
          </FormHelperText>
        </>
      )}
      <br />
      <Stack direction="row" justifyContent="space-between">
        <Button
          variant="text"
          onClick={() => setIsLoginVisible(!isLoginVisible)}
          // color="primary"
          sx={{ color: theme.palette.secondary.dark }}
        >
          <Text variant="body2" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({
              id: isLoginVisible
                ? "welcomeScreen_notRegisteredYetButton"
                : "welcomeScreen_alreadyRegisteredButton",
            })}
          </Text>
        </Button>
        <Button
          variant="contained"
          sx={{ minWidth: 120, backgroundColor: theme.palette.secondary.light }}
          onClick={() => {
            if (isLoginVisible) {
              handleLogin();
            } else {
              console.log("Handling registration...");
              handleRegistration();
            }
          }}
        >
          {isLoading ? (
            <CircularLoading />
          ) : (
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: isLoginVisible
                  ? "common_login"
                  : "registrationCodeSubmitButton",
              })}
            </Text>
          )}
        </Button>
      </Stack>
    </Paper>
  );
};

export default Login;
