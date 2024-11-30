/**
 * THIS FILE IS FOR TESTING PURPOSES ONLY
 */
import {
  FC,
  RefObject,
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useIntl } from "react-intl";

import { useTeacherContext } from "../../context/teacherContext";
import Layout from "../layout/layout";
import useClassroom from "../../hooks/useClassroom";

import Controls from "./classroomComponents/_controls";
import Videos, { VideoRefObject } from "./classroomComponents/_videos";

const Classroom: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useTeacherContext();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef2 = useRef<HTMLVideoElement>(null);
  const remoteVideoRef3 = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const remoteStream2 = useRef<MediaStream | null>(null);
  const remoteStream3 = useRef<MediaStream | null>(null);
  const [participants, setParticipants] = useState<VideoRefObject[]>([
    {
      id: info.teacherID || "",
      label: info.preferredName || "",
      ref: localVideoRef,
    },
  ]);
  const addParticipant = useCallback<(id: string, stream: MediaStream) => void>(
    (id, stream) => {
      // const participantInfo = fetchStudentInfo(); // TODO: implement fetchStudentInfo
      let label: string;
      let newParticipantRef: RefObject<HTMLVideoElement>;

      if (participants.length === 1) {
        remoteStream.current = stream;
        newParticipantRef = remoteVideoRef;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        label = "Student 1";
      } else if (participants.length === 2) {
        remoteStream2.current = stream;
        newParticipantRef = remoteVideoRef2;
        if (remoteVideoRef2.current) {
          remoteVideoRef2.current.srcObject = stream;
        }
        label = "Student 2";
      } else if (participants.length === 3) {
        remoteStream3.current = stream;
        newParticipantRef = remoteVideoRef3;
        if (remoteVideoRef3.current) {
          remoteVideoRef3.current.srcObject = stream;
        }
        label = "Student 3";
      }
      setParticipants((prevParticipants) => [
        ...prevParticipants,
        {
          id,
          label,
          ref: newParticipantRef,
        },
      ]);
    },
    [remoteVideoRef, remoteVideoRef2, remoteVideoRef3]
  );
  const removeParticipant = useCallback<(id: string) => void>((id) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((participant) => participant.id !== id)
    );
  }, []);
  const { peerConnections, sendMessage, broadcastOffer } = useClassroom({
    addParticipant,
    removeParticipant,
    localStream: localStream.current,
  });
  console.log("peerConnections: ", peerConnections);
  const peerConnectionsIDs = useMemo(
    () => Object.keys(peerConnections),
    [peerConnections]
  );
  const peerConnectionsList = useMemo(
    () => Object.values(peerConnections),
    [peerConnections]
  );
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceLabel, setSelectedAudioDeviceLabel] =
    useState("Default");
  const [selectedAudioDeviceID, setSelectedAudioDeviceID] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceLabel, setSelectedVideoDeviceLabel] =
    useState("Default");
  const [selectedVideoDeviceID, setSelectedVideoDeviceID] = useState("");
  const [callSettingsAnchorEl, setCallSettingsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [callSettingsMenuIsOpen, setCallSettingsMenuIsOpen] = useState(false);

  const handleOpenCallSettingsMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setCallSettingsAnchorEl(event.currentTarget);
    setCallSettingsMenuIsOpen(true);
  };
  const handleCloseCallSettingsMenu = () => {
    setCallSettingsMenuIsOpen(false);
    setCallSettingsAnchorEl(null);
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };
  const toggleAudio = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const handleSelectVideoDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: { deviceId: { exact: selectedAudioDeviceID } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setSelectedVideoDeviceID(deviceId);
      setSelectedVideoDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting video stream with the selected device: ", // TODO: localize
        error
      );
    }
  };
  const handleSelectAudioDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: selectedVideoDeviceID } },
        audio: { deviceId: { exact: deviceId } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setSelectedAudioDeviceID(deviceId);
      setSelectedAudioDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting audio stream with the selected device: ", // TODO: localize
        error
      );
    }
  };

  const fetchDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioStreamDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );
    const videoStreamDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setAudioDevices(audioStreamDevices);
    setSelectedAudioDeviceID(audioStreamDevices[0].deviceId);
    setSelectedAudioDeviceLabel(audioStreamDevices[0].label);
    setVideoDevices(videoStreamDevices);
    setSelectedVideoDeviceID(videoStreamDevices[0].deviceId);
    setSelectedVideoDeviceLabel(videoStreamDevices[0].label);
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsMicOn(true);
      setIsVideoOn(true);
      await fetchDevices();
    } catch (error) {
      console.error("Error starting media: ", error);
    }
  };

  // const broadcastOffer = () => {
  //   console.log("Broadcasting offer to all participants");
  //   console.log("Participants: ", peerConnectionsIDs);
  //   peerConnectionsIDs.forEach(async (ID) => {
  //     console.log("Creating offer for participant: ", ID);
  //     const offer = await peerConnections[ID].createOffer();
  //     console.log(`Offer created for participant ${ID}: `, offer);
  //     await peerConnections[ID].setLocalDescription(offer);
  //     sendMessage(
  //       JSON.stringify({
  //         type: "offer",
  //         target: ID,
  //         data: offer,
  //       })
  //     );
  //   });
  // };

  useEffect(() => {
    startMedia();
  }, []);

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_classroom" })}>
      <Videos participants={participants} />
      <Controls
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        selectedAudioDeviceLabel={selectedAudioDeviceLabel}
        selectedVideoDeviceLabel={selectedVideoDeviceLabel}
        handleSelectAudioDevice={handleSelectAudioDevice}
        handleSelectVideoDevice={handleSelectVideoDevice}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        handleOpenCallSettingsMenu={handleOpenCallSettingsMenu}
        handleCloseCallSettingsMenu={handleCloseCallSettingsMenu}
        callSettingsAnchorEl={callSettingsAnchorEl}
        callSettingsMenuIsOpen={callSettingsMenuIsOpen}
        broadcastOffer={broadcastOffer}
      />
    </Layout>
  );
};

export default Classroom;
