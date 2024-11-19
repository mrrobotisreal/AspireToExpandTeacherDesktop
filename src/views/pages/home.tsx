import React, { FC, useEffect } from "react";
import { useIntl } from "react-intl";

import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import Layout from "../layout/layout";
import Text from "../text/text";

const Home: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useStudentContext();
  const { theme, regularFont, heavyFont } = useThemeContext();
  const { firstName } = info;

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_home" })}>
      <Text variant="h4" fontFamily={heavyFont} color="textPrimary">
        {intl.formatMessage({ id: "common_welcome" }, { firstName })}
      </Text>
      <Text variant="body1" fontFamily={regularFont} color="textPrimary">
        {intl.formatMessage({ id: "home_description" })}
      </Text>
    </Layout>
  );
};

export default Home;
