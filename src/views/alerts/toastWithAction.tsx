import React, { FC, ReactNode } from "react";
import {
  Alert,
  AlertProps,
  Button,
  ButtonProps,
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

interface ToastWithActionProps {
  message: string | ReactNode;
  actionText: string | ReactNode;
  alertProps?: AlertProps;
  buttonProps?: ButtonProps;
  snackbarProps?: SnackbarProps;
}

const ToastWithAction: FC<ToastWithActionProps> = ({
  message,
  actionText,
  alertProps,
  buttonProps,
  snackbarProps,
}) => {
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
        <Button
          variant="contained"
          size="small"
          sx={{ m: 1, fontFamily: regularFont }}
          {...buttonProps}
        >
          {actionText}
        </Button>
      </Alert>
    </Snackbar>
  );
};

export default ToastWithAction;
