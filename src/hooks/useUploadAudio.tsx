import { v4 as uuidv4 } from "uuid";

import { MAIN_SERVER_URL } from "../constants/urls";

interface UseUploadAudioReturns {
  uploadAudioMessage: (
    audioBlob: Blob,
    chatId: string
  ) => Promise<{ audioURL: string; filename: string } | null>;
}

async function uploadAudioMessage(
  audioBlob: Blob,
  chatId: string
): Promise<{ audioURL: string; filename: string } | null> {
  try {
    const formattedChatId = chatId.replace(/[-]/g, "_");
    const formData = new FormData();
    const audioId = uuidv4();
    const filename = `${audioId}.webm`;
    formData.append("audio", audioBlob, filename);

    // const response = await fetch(`${MAIN_SERVER_URL}/chats/upload/audio`, {
    //   method: "POST",
    //   body: formData,
    // });

    const response = await fetch("http://localhost:11115/chats/upload/audio", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload audio: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      audioURL: data.audio_url,
      filename,
    };
  } catch (error) {
    console.error("Error uploading audio: ", error);
    return null;
  }
}

const useUploadAudio = (): UseUploadAudioReturns => ({
  uploadAudioMessage,
});

export default useUploadAudio;
