/**
 * THIS FILE IS FOR TESTING PURPOSES ONLY
 */
import { FC, RefObject, useCallback, useRef, useEffect } from "react";
import { Box, Grid } from "@mui/material";

export interface VideoRefObject {
  id: string;
  label: string;
  ref: RefObject<HTMLVideoElement>;
}

export interface VideoRefObjects {
  [id: string]: VideoRefObject;
}

interface VideosProps {
  participants: Array<VideoRefObject>;
}

const Videos: FC<VideosProps> = ({ participants }) => {
  const participantCount = participants.length;

  return (
    <Grid container>
      {participantCount === 1 && (
        <Grid item xs={12}>
          <video
            ref={participants[0].ref}
            muted
            autoPlay
            playsInline
            style={{
              height: "76vh",
              width: "100%",
              border: "1px solid black",
              borderRadius: "6px",
              backgroundImage:
                "linear-gradient(to left top,#78290f,#ff7d00,#ffbf69,#cbf3f0,#2ec4b6,#006d77,#001524)",
            }}
          />
        </Grid>
      )}
      {participantCount === 2 && (
        <>
          <Grid item xs={12}>
            <video
              ref={participants[1].ref}
              muted
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
          </Grid>
          <Grid item xs={12}>
            <video
              ref={participants[0].ref}
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
          </Grid>
        </>
      )}
      {participantCount === 3 && (
        <>
          <Grid item xs={12}>
            <video
              ref={participants[2].ref}
              muted
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
          </Grid>
          <Grid item xs={6}>
            <video
              ref={participants[1].ref}
              muted
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
          </Grid>
          <Grid item xs={6}>
            <video
              ref={participants[0].ref}
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
          </Grid>
        </>
      )}
      {participantCount === 4 && (
        <>
          {participants.toReversed().map((participant, index) => (
            <Grid item xs={6} key={participant.id}>
              <video
                ref={participant.ref}
                muted={index === 3}
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
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );
};

export default Videos;
