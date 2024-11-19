import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import de_DE from "../../locales/de_DE.json";
import en_US from "../../locales/en_US.json";
import ru_RU from "../../locales/ru_RU.json";
import uk_UA from "../../locales/uk_UA.json";

interface MessagesContextProps {
  locale: string;
  messages: typeof en_US;
  changeLocale: (newLocale: string) => void;
}

const MessagesContext = createContext<MessagesContextProps>({
  locale: "en",
  messages: en_US,
  changeLocale: (newLocale: string) => {},
});

export const useMessagesContext = () =>
  useContext<MessagesContextProps>(MessagesContext);

const MessagesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<string>("en");
  const [messages, setMessages] = useState<typeof en_US>(en_US);

  const changeLocale = (newLocale: string) => {
    switch (newLocale) {
      case "en":
        setLocale("en");
        setMessages(en_US);
        break;
      case "en-US":
        setLocale("en");
        setMessages(en_US);
        break;
      case "en_US":
        setLocale("en");
        setMessages(en_US);
        break;
      case "ru":
        setLocale("ru");
        setMessages(ru_RU);
        break;
      case "ru-RU":
        setLocale("ru");
        setMessages(ru_RU);
        break;
      case "ru_RU":
        setLocale("ru");
        setMessages(ru_RU);
        break;
      case "uk":
        setLocale("uk");
        setMessages(uk_UA);
        break;
      case "uk-UA":
        setLocale("uk");
        setMessages(uk_UA);
        break;
      case "uk_UA":
        setLocale("uk");
        setMessages(uk_UA);
        break;
      case "de":
        setLocale("de");
        setMessages(de_DE);
        break;
      case "de-DE":
        setLocale("de");
        setMessages(de_DE);
        break;
      case "de_DE":
        setLocale("de");
        setMessages(de_DE);
        break;
      default:
        setLocale("en");
        setMessages(en_US);
    }
  };

  const values = {
    locale,
    messages,
    changeLocale,
  };

  return (
    <MessagesContext.Provider value={values}>
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesProvider;
