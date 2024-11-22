import { MAIN_SERVER_URL } from "../constants/urls";
import { useTeacherContext } from "../context/teacherContext";

interface UseEncryptionReturns {
  generateKeyPair: () => Promise<{ publicKey: string; privateKey: string }>;
  encrypt: (data: string) => Promise<string | null>;
  decrypt: (data: string) => Promise<string | null>;
}

async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  try {
    const keyPair = await window.electronAPI.generateKeyPair();

    return keyPair;
  } catch (error) {
    console.error("Error generating key pair: ", error);
    return { publicKey: "", privateKey: "" };
  }
}

async function encrypt(data: string): Promise<string | null> {
  return null;
}

async function decrypt(data: string): Promise<string | null> {
  return null;
}

const useEncryption = (): UseEncryptionReturns => ({
  generateKeyPair,
  encrypt,
  decrypt,
});

export default useEncryption;
