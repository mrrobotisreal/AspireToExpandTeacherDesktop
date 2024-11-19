import { Box, CircularProgress } from "@mui/material";

const CircularLoading = () => {
  return (
    <Box alignSelf="center" alignContent="center" justifyContent="center">
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="progressGradient" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="0%" stopColor="#78290f" />
            <stop offset="100%" stopColor="#ffbf69" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        size={40}
        thickness={6}
        variant="indeterminate"
        sx={{
          "svg circle": {
            stroke: "url(#progressGradient)",
          },
        }}
      />
    </Box>
  );
};

export default CircularLoading;
