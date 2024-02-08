import React, { useEffect, useState } from 'react';
import { Typography, Flex, Space, Alert } from 'antd';
import { api } from '~/utils/api';
import { useSession, signIn, signOut } from 'next-auth/react';
const { Title } = Typography;

export default function Home() {
  return (
    <>
      <Space direction="vertical" size="middle" align="center" style={{ display: 'flex', height: '100%' }}>
        <Flex justify="center" align="center">
          <Title style={{
            textTransform: 'uppercase',
            background: 'linear-gradient(to right, #30CFD0 0%, #330867 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '4rem',
          }}>T3 Ant Design</Title>
        </Flex>
        <Flex justify="center" align="center">
          <Title level={5}>Template</Title>
        </Flex>
      </Space>
    </>
  );
};
