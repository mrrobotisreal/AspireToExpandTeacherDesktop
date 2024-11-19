import React, { FC } from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";

interface TextProps extends TypographyProps {}

const Text: FC<TextProps> = ({ fontFamily, children, ...props }: TextProps) => {
  // TODO: use context here for fontFamily, lightTheme, darkTheme, etc...
  const selectedFontFamily = fontFamily ?? "Bauhaus-Medium";

  return (
    <Typography fontFamily={selectedFontFamily} {...props}>
      {children}
    </Typography>
  );
};

export default Text;
