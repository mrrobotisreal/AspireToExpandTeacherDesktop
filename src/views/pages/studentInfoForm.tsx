import React, { FC, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slide,
  SnackbarCloseReason,
  TextField,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import bcrypt from "bcryptjs";

import { MAIN_SERVER_URL } from "../../constants/urls";
import { useThemeContext } from "../../context/themeContext";
import CircularLoading from "../loading/circular";
import Layout from "../layout/layout";
import Text from "../text/text";
import Toast from "../alerts/toast";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StudentInfoForm: FC = () => {
  const intl = useIntl();
  const { state } = useLocation();
  const { firstName, lastName, email } = state;
  const { theme, regularFont, heavyFont } = useThemeContext();
  const [nativeLanguage, setNativeLanguage] = useState("uk");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [enteredFirstName, setEnteredFirstName] = useState(firstName);
  const [enteredPreferredName, setEnteredPreferredName] = useState(firstName);
  const [enteredLastName, setEnteredLastName] = useState(lastName);
  const [emailAddress, setEmailAddress] = useState(email);
  const [isEmailAddressValid, setIsEmailAddressValid] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const [isConfirmInfoDialogOpen, setIsConfirmInfoDialogOpen] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState(
    intl.formatMessage({
      id: "welcomeScreen_snackbarSuccessfulRegistration",
    })
  );
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectNativeLanguage = (event: SelectChangeEvent) =>
    setNativeLanguage(event.target.value);
  const handleSelectPreferredLanguage = (event: SelectChangeEvent) =>
    setPreferredLanguage(event.target.value);

  const handleFirstName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEnteredFirstName(event.target.value);
  const handlePreferredName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEnteredPreferredName(event.target.value);
  const handleLastName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEnteredLastName(event.target.value);

  const handleEmailAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(event.target.value);
    validateEmailAddress(event.target.value);
  };
  const validateEmailAddress = (email: string) => {
    if (!emailRegex.test(email)) {
      setIsEmailAddressValid(false);
      setEmailError(
        intl.formatMessage({ id: "studentInfoForm_emailErrorText_invalid" })
      );
    } else {
      setIsEmailAddressValid(true);
      setEmailError(null);
    }
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    validatePassword(event.target.value);
  };
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lengthTooShort",
        })
      );
    } else if (password.length > 16) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lengthTooLong",
        })
      );
    } else if (!password.match(/[a-z]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_lowercase",
        })
      );
    } else if (!password.match(/[A-Z]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_uppercase",
        })
      );
    } else if (!password.match(/[0-9]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({ id: "studentInfoForm_passwordErrorText_number" })
      );
    } else if (!password.match(/[!@#$%^&*]/)) {
      setIsPasswordValid(false);
      setPasswordError(
        intl.formatMessage({
          id: "studentInfoForm_passwordErrorText_specialCharacter",
        })
      );
    } else {
      setIsPasswordValid(true);
      setPasswordError(null);
    }
  };

  const handleConfirmInfoDialogOpen = () => setIsConfirmInfoDialogOpen(true);
  const handleConfirmInfoDialogClose = () => setIsConfirmInfoDialogOpen(false);

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSnackbarOpen(false);
  };

  const handleSubmitInfo = () => {
    hashPasswordAndSendInfo();
  };

  const hashPasswordAndSendInfo = async () => {
    setIsLoading(true);
    try {
      const salt = window.electronAPI.getSalt();
      const hashedPassword = bcrypt.hashSync(password, salt);
      const shortenedHash = hashedPassword.slice(0, 32);
      console.log("(StudentInfoForm) Hashed password: ", shortenedHash);
      const response = await fetch(`${MAIN_SERVER_URL}/students/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          native_language: nativeLanguage,
          preferred_language: preferredLanguage,
          first_name: enteredFirstName,
          preferred_name: enteredPreferredName,
          last_name: enteredLastName,
          email_address: emailAddress,
          password: shortenedHash,
          theme_mode: "system",
          font_style: "Bauhaus",
        }),
      });
      setIsConfirmInfoDialogOpen(false);

      if (response.status === 201 || response.status === 200) {
        setToastMessage("Student information submitted successfully!"); // TODO: localize
        setIsSnackbarOpen(true);
        setEnteredFirstName("");
        setEnteredPreferredName("");
        setEnteredLastName("");
        setEmailAddress("");
        setPassword("");
      } else {
        setToastSeverity("error");
        setToastMessage("Error submitting student information"); // TODO: localize
        setIsSnackbarOpen(true);
        console.error("Error submitting student information"); // TODO: localize
      }
      setIsLoading(false);
    } catch (error) {
      console.error(`Error hashing password: ${error}`); // TODO: localize
      setIsLoading(false);
    }
  };

  return (
    <Layout title={intl.formatMessage({ id: "studentInfoForm_title" })}>
      <Text variant="h4" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "common_welcome" }, { firstName })}
      </Text>
      <Text variant="body1" fontFamily={regularFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_description" })}
      </Text>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "studentInfoForm_nativeLanguageLabel" })}:
      </Text>
      <FormControl sx={{ maxWidth: 375 }}>
        <Select
          id="nativeLanguage"
          value={nativeLanguage}
          onChange={handleSelectNativeLanguage}
        >
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
        <FormHelperText>
          <Text variant="caption" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({
              id: "studentInfoForm_nativeLanguageHelperText",
            })}
          </Text>
        </FormHelperText>
      </FormControl>
      <br />
      <br />
      <Text
        variant="h6"
        fontWeight="bold"
        fontFamily={heavyFont}
        color="textPrimary"
      >
        {intl.formatMessage({ id: "studentInfoForm_preferredLanguageLabel" })}:
      </Text>
      <FormControl sx={{ maxWidth: 375 }}>
        <Select
          id="preferredLanguage"
          value={preferredLanguage}
          onChange={handleSelectPreferredLanguage}
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
        <FormHelperText>
          <Text variant="caption" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({
              id: "studentInfoForm_preferredLanguageHelperText",
            })}
          </Text>
        </FormHelperText>
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_inputFirstName" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_firstName" })}
            </Text>
          }
          type="text"
          value={enteredFirstName}
          onChange={handleFirstName}
        />
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_inputPreferredName" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_preferredName" })}
            </Text>
          }
          type="text"
          value={enteredPreferredName}
          onChange={handlePreferredName}
          helperText={
            <Text
              variant="caption"
              fontFamily={regularFont}
              color="textPrimary"
            >
              {intl.formatMessage({
                id: "studentInfoForm_inputPreferredNameHelperText",
              })}
            </Text>
          }
        />
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_inputLastName" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_lastName" })}
            </Text>
          }
          type="text"
          value={enteredLastName}
          onChange={handleLastName}
        />
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_emailInputLabel" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: isEmailAddressValid
                  ? "common_emailAddress"
                  : "common_errorTitle",
              })}
            </Text>
          }
          type="email"
          value={emailAddress}
          onChange={handleEmailAddress}
          error={!isEmailAddressValid}
          helperText={
            <Text
              variant="caption"
              color={isEmailAddressValid ? "textPrimary" : "error"}
              fontFamily={regularFont}
            >
              {isEmailAddressValid
                ? intl.formatMessage({ id: "studentInfoForm_emailHelperText" })
                : emailError}
            </Text>
          }
        />
      </FormControl>
      <br />
      <br />
      <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "studentInfoForm_passwordInputLabel" })}:
      </Text>
      <FormControl sx={{ minWidth: 375 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: isPasswordValid
                  ? "common_passwordTitle"
                  : "common_errorTitle",
              })}
            </Text>
          }
          type="password"
          value={password}
          onChange={handlePassword}
          error={!isPasswordValid}
          helperText={
            <Text
              variant="caption"
              color={isPasswordValid ? "textPrimary" : "error"}
              fontFamily={regularFont}
            >
              {isPasswordValid
                ? intl.formatMessage({
                    id: "studentInfoForm_passwordHelperText",
                  })
                : passwordError}
            </Text>
          }
        />
      </FormControl>
      <br />
      <br />
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{ backgroundColor: theme.palette.secondary.light }}
          onClick={handleConfirmInfoDialogOpen}
          disabled={
            !nativeLanguage ||
            !preferredLanguage ||
            !enteredFirstName ||
            !enteredPreferredName ||
            !enteredLastName ||
            !isEmailAddressValid ||
            !emailAddress ||
            !isPasswordValid ||
            !password
          }
        >
          <Text variant="button" fontFamily={regularFont} color="textPrimary">
            {intl.formatMessage({ id: "common_submit" })}
          </Text>
        </Button>
      </Box>
      <Dialog
        open={isConfirmInfoDialogOpen}
        onClose={handleConfirmInfoDialogClose}
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main }}>
          <Text variant="h5" fontFamily={heavyFont} color="textPrimary">
            {intl.formatMessage({ id: "studentInfoForm_confirmInfoTitle" })}
          </Text>
          <Divider />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_nativeLanguage" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: `common_language_${nativeLanguage}`,
              })}
            </Text>
          </DialogContentText>
          <br />
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_preferredLanguage" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({
                id: `common_language_${preferredLanguage}`,
              })}
            </Text>
          </DialogContentText>
          <br />
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_firstName" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {enteredFirstName}
            </Text>
          </DialogContentText>
          <br />
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_preferredName" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {enteredPreferredName}
            </Text>
          </DialogContentText>
          <br />
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_lastName" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {enteredLastName}
            </Text>
          </DialogContentText>
          <br />
          <DialogContentText>
            <Text variant="h6" fontFamily={heavyFont} color="textPrimary">
              {intl.formatMessage({ id: "common_emailAddress" })}:
            </Text>
          </DialogContentText>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} color="textPrimary">
              {emailAddress}
            </Text>
          </DialogContentText>
          <br />
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmInfoDialogClose} color="secondary">
            <Text variant="button" fontFamily={regularFont} color="textPrimary">
              {intl.formatMessage({ id: "common_cancel" })}
            </Text>
          </Button>
          <Button
            onClick={() => handleSubmitInfo()}
            sx={{ backgroundColor: theme.palette.secondary.light }}
            variant="contained"
          >
            {isLoading ? (
              <CircularLoading />
            ) : (
              <Text
                variant="button"
                fontFamily={regularFont}
                color="textPrimary"
              >
                {intl.formatMessage({ id: "common_confirm" })}
              </Text>
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Toast
        message={toastMessage}
        alertProps={{
          severity: toastSeverity,
          onClose: handleCloseSnackbar,
        }}
        snackbarProps={{
          open: isSnackbarOpen,
          onClose: handleCloseSnackbar,
        }}
      />
    </Layout>
  );
};

export default StudentInfoForm;
