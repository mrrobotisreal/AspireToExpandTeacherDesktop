import { FC, RefObject } from "react";
import { Box, Tooltip } from "@mui/material";

interface VideosProps {
  isInClassroom: boolean;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isRemoteStreamActive: boolean;
  isFullscreen: boolean;
}

const Videos: FC<VideosProps> = ({
  isInClassroom,
  localVideoRef,
  remoteVideoRef,
  isRemoteStreamActive,
  isFullscreen,
}) => {
  return (
    <Box
      sx={{
        position: isFullscreen ? "fixed" : "relative",
        width: isInClassroom ? (isFullscreen ? "100vw" : "100%") : "0vw",
        height: isInClassroom ? (isFullscreen ? "100vh" : "100%") : "0vh",
        zIndex: isFullscreen ? 9999 : "auto",
        bottom: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        overflow: "hidden",
        visibility: isInClassroom ? "visible" : "hidden",
      }}
    >
      <Tooltip title="Student's video" placement="top" arrow>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            height: isFullscreen ? "100vh" : "76vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: isFullscreen ? "0" : "6px",
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
            height: isRemoteStreamActive
              ? "100px"
              : isFullscreen
                ? "100vh"
                : "76vh",
            width: isRemoteStreamActive ? "150px" : "100%",
            border: isRemoteStreamActive
              ? "2px solid white"
              : "1px solid black",
            borderRadius: isFullscreen
              ? isRemoteStreamActive
                ? "6px"
                : "0"
              : "6px",
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
