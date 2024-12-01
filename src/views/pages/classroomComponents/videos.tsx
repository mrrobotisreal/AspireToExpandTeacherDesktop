import { FC, RefObject } from "react";
import { Box, Tooltip } from "@mui/material";

interface VideosProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isRemoteStreamActive: boolean;
}

const Videos: FC<VideosProps> = ({
  localVideoRef,
  remoteVideoRef,
  isRemoteStreamActive,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Tooltip title="Student's video" placement="top" arrow>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            height: "76vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            visibility: isRemoteStreamActive ? "visible" : "hidden",
            objectFit: "cover",
            backgroundImage:
              "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
          }}
        />
      </Tooltip>
      <Tooltip title="Your local video" placement="bottom" arrow>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          style={{
            position: "absolute",
            bottom: isRemoteStreamActive ? "10px" : "50%",
            right: isRemoteStreamActive ? "10px" : "50%",
            transform: isRemoteStreamActive
              ? "translate(0, 0)"
              : "translate(50%, 50%)",
            height: isRemoteStreamActive ? "100px" : "76vh",
            width: isRemoteStreamActive ? "150px" : "100%",
            border: isRemoteStreamActive
              ? "2px solid white"
              : "1px solid black",
            borderRadius: "6px",
            boxShadow: isRemoteStreamActive
              ? "0px 4px 6px rgba(0, 0, 0, 0.3)"
              : "none",
            transition: "all 0.3s ease-in-out",
            objectFit: "cover",
            backgroundImage:
              "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default Videos;
