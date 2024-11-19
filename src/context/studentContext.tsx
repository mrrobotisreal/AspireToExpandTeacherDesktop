import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import { AppFontStyle } from "../constants/fonts";
import { MAIN_SERVER_URL } from "../constants/urls";
import { ThemeMode } from "./themeContext";

interface StudentInfo {
  studentId?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  emailAddress?: string;
  nativeLanguage?: string;
  preferredLanguage?: string;
  themeMode?: ThemeMode;
  fontStyle?: AppFontStyle;
  profilePicturePath?: string;
  timeZone?: string;
  // TODO: Add more fields
}

interface StudentInfoContext {
  info: StudentInfo;
  getInfo: () => StudentInfo | null;
  removeInfo: () => void;
  updateInfo: (newInfo: StudentInfo) => void;
  updateInfoOnServer: (newInfo: UpdateStudentInfoRequest) => Promise<void>;
}

const getInfo = () => {
  const info = localStorage.getItem("studentInfo");

  return info ? JSON.parse(info) : null;
};

const removeInfo = () => localStorage.removeItem("studentInfo");

const StudentContext = createContext<StudentInfoContext>({
  info: {},
  getInfo,
  removeInfo,
  updateInfo: () => {},
  updateInfoOnServer: async () => {},
});

export const useStudentContext = () =>
  useContext<StudentInfoContext>(StudentContext);

interface UpdateStudentInfoRequest {
  student_id?: string;
  email_address: string;
  preferred_name?: string;
  preferred_language?: string;
  theme_mode?: ThemeMode;
  font_style?: AppFontStyle;
  profile_picture_path?: string;
  time_zone?: string;
}

const updateInfoOnServer = async (newInfo: UpdateStudentInfoRequest) => {
  try {
    const response = await fetch(`${MAIN_SERVER_URL}/students/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(newInfo),
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Student info updated successfully on the server");
    }
  } catch (error) {
    console.error("Error updating student info:", error); // TODO: localize
    throw error;
  }
};

interface StudentProviderProps {
  children: ReactNode;
}

const StudentProvider: FC<StudentProviderProps> = ({ children }) => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({});

  const updateInfo = (newInfo: StudentInfo) => {
    setStudentInfo(newInfo);
    localStorage.setItem("studentInfo", JSON.stringify(newInfo));
  };

  const values = {
    info: studentInfo,
    getInfo,
    removeInfo,
    updateInfo,
    updateInfoOnServer,
  };

  return (
    <StudentContext.Provider value={values}>{children}</StudentContext.Provider>
  );
};

export default StudentProvider;
