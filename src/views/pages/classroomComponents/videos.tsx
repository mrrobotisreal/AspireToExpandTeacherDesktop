import { FC, RefObject } from "react";
import { Tooltip } from "@mui/material";

interface VideosProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
}

const Videos: FC<VideosProps> = ({ localVideoRef, remoteVideoRef }) => {
  return (
    <>
      <Tooltip title="Student's video" placement="top" arrow>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
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
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundImage:
              "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
          }}
        />
      </Tooltip>
    </>
  );
};

export default Videos;
