import React, { useState } from 'react';
import Head from "next/head";
import {
  UserOutlined,
  HomeOutlined,
  PoweroffOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Space, Button, ConfigProvider, Switch, Typography } from 'antd';
import { useRouter } from 'next/router';
import styles from "./index.module.css";
import { useSession, signIn, signOut } from 'next-auth/react';

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Content, Footer, Sider } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  // theme?: 'light' | 'dark',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    theme: 'light'
  } as MenuItem;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: sessionData, status } = useSession();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [selectedMenu, setSelectedMenu] = useState<string[]>([]);

  const items: MenuItem[] = [
    getItem('Home', '/', <HomeOutlined />),
    getItem('Users', '/user', <TeamOutlined />),
    getItem(sessionData?.user?.email ?? '', 'user', <UserOutlined style={{ color: '#f56a00' }} />, [
      getItem('', 'logout',
        <Button
          danger
          type="text"
          icon={<PoweroffOutlined />}
          block
          onClick={() => void signOut().catch(console.error)}
        >
          Log out
        </Button>),
      getItem('Theme', 'darkmode',
        <Space direction="vertical">
          <Switch
            onChange={() => setIsDarkMode(!isDarkMode)}
            value={isDarkMode}
            checkedChildren="🌜"
            unCheckedChildren="🌞"
          />
        </Space>
      ),
    ]),
  ];

  const LoginButton = () => (<div className={styles.showcaseContainer}>
    <Button shape="round" type="primary" size="large" onClick={sessionData ? () => void signOut() : () => void signIn()}>Log in</Button>
  </div>)

  const MainLayout = () => (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Menu
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={(e: { key: string }) => {
            const { key } = e;

            if (key === 'logout') {
              signOut().catch(console.error);
            }
            else if (key === 'darkmode') {
              //setIsDarkMode(!isDarkMode);
            }
            else {
              setSelectedMenu([key]);
              router.push(
                {
                  pathname: key,
                  //query: { structureId: id },
                },
                undefined,
                { shallow: true },
              ).catch(console.error);
            }
          }}
          selectedKeys={selectedMenu}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px', minHeight: 500, height: '100%' }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>T3 Ant Design Footer ©2024</Footer>
      </Layout>
    </Layout>
  )

  const LogOutLayour = () => (
    <main className={styles.main}>
      <div className={styles.container}>
        <Title style={{ color: 'white' }}>T3 Ant Design <span className={styles.pinkSpan}>Template</span></Title>
        {
          status != 'loading' && <LoginButton />
        }
      </div>
    </main>
  )

  return (
    <>
      <Head>
        <title>T3 Ant Design Template</title>
        <meta name="description" content="T3 Ant Design Template" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        {
          status === 'authenticated' ? (<MainLayout />) : (<LogOutLayour />)
        }
      </ConfigProvider >
    </>
  )
}