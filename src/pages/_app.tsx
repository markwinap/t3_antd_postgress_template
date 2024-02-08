import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { ConfigProvider } from 'antd';
import { api } from "~/utils/api";
import theme from '../theme/themeConfig';
import MainLayout from "~/components/layout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ConfigProvider theme={theme}>
      <SessionProvider session={session}>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </SessionProvider>
    </ConfigProvider>
  );
};

export default api.withTRPC(MyApp);
