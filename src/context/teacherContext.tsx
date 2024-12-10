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

interface TeacherInfo {
  teacherID?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  emailAddress?: string;
  nativeLanguage?: string;
  preferredLanguage?: string;
  themeMode?: ThemeMode;
  fontStyle?: AppFontStyle;
  profilePictureURL?: string;
  profilePicturePath?: string;
  timeZone?: string;
  lessonsTaught?: number;
  // TODO: Add more fields
}

interface UpcomingClass {
  dateAndTime: string;
  preferredName: string;
  profilePicURL: string;
  room: string;
  studentID: string;
  subject: string;
}

interface TeacherInfoContext {
  info: TeacherInfo;
  getInfo: () => TeacherInfo | null;
  removeInfo: () => void;
  updateInfo: (newInfo: TeacherInfo) => void;
  updateInfoOnServer: (newInfo: UpdateTeacherInfoRequest) => Promise<void>;
  classes: UpcomingClass[];
  fetchClasses: () => Promise<void>;
}

const getInfo = () => {
  const info = localStorage.getItem("teacherInfo");

  return info ? JSON.parse(info) : null;
};

const removeInfo = () => localStorage.removeItem("teacherInfo");

const TeacherContext = createContext<TeacherInfoContext>({
  info: {},
  getInfo,
  removeInfo,
  updateInfo: () => {},
  updateInfoOnServer: async () => {},
  classes: [],
  fetchClasses: async () => {},
});

export const useTeacherContext = () =>
  useContext<TeacherInfoContext>(TeacherContext);

interface UpdateTeacherInfoRequest {
  teacherID: string;
  email_address?: string;
  preferred_name?: string;
  preferred_language?: string;
  theme_mode?: ThemeMode;
  font_style?: AppFontStyle;
  profile_picture_url?: string;
  profile_picture_path?: string;
  time_zone?: string;
  public_key?: string;
  lessons_taught?: number;
}

const updateInfoOnServer = async (newInfo: UpdateTeacherInfoRequest) => {
  try {
    const response = await fetch(`${MAIN_SERVER_URL}/teachers/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(newInfo),
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Teacher info updated successfully on the server");
    }
  } catch (error) {
    console.error("Error updating teacher info:", error); // TODO: localize
    throw error;
  }
};

interface StudentProviderProps {
  children: ReactNode;
}

const TeacherProvider: FC<StudentProviderProps> = ({ children }) => {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({});
  const [classes, setClasses] = useState<UpcomingClass[]>([]);

  const updateInfo = (newInfo: TeacherInfo) => {
    setTeacherInfo(newInfo);
    localStorage.setItem("teacherInfo", JSON.stringify(newInfo));
  };

  const fetchClasses = async () => {
    setClasses([
      {
        dateAndTime: "2024-12-02T10:00:00",
        preferredName: "Koala",
        profilePicURL: "file:///Users/mitchwintrow/Pictures/koala1.jpg",
        room: "123",
        studentID: "koala-123-abc",
        subject: "Punctuation",
      },
      {
        dateAndTime: "2024-12-02T11:00:00",
        preferredName: "Mitch",
        profilePicURL:
          "file:///Users/mitchwintrow/Pictures/mitchProfilePic.png",
        room: "123",
        studentID: "mitch-123-abc",
        subject: "Critical Thinking",
      },
      {
        dateAndTime: "2024-12-02T12:00:00",
        preferredName: "Koalita",
        profilePicURL: "file:///Users/mitchwintrow/Pictures/koala2.jpg",
        room: "123",
        studentID: "koalita-123-abc",
        subject: "Grammar",
      },
    ]);
  };

  const values = {
    info: teacherInfo,
    getInfo,
    removeInfo,
    updateInfo,
    updateInfoOnServer,
    classes,
    fetchClasses,
  };

  return (
    <TeacherContext.Provider value={values}>{children}</TeacherContext.Provider>
  );
};

export default TeacherProvider;
