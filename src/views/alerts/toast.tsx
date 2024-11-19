import React, { FC, ReactNode } from "react";
import {
  Alert,
  AlertProps,
  Slide,
  Snackbar,
  SnackbarProps,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

import { useThemeContext } from "../../context/themeContext";

const defaultAutoHideDuration = 6000;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ToastProps {
  message: string | ReactNode;
  alertProps?: AlertProps;
  snackbarProps?: SnackbarProps;
}

const Toast: FC<ToastProps> = ({ message, alertProps, snackbarProps }) => {
  const { regularFont } = useThemeContext();

  return (
    <Snackbar
      autoHideDuration={
        snackbarProps?.autoHideDuration || defaultAutoHideDuration
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      TransitionComponent={Transition}
      {...snackbarProps}
    >
      <Alert
        variant="filled"
        sx={{ width: "100%", fontFamily: regularFont }}
        {...alertProps}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
