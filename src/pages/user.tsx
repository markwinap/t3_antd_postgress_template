import React, { useEffect, useState } from 'react';
// Antd
import {
    MoreOutlined,
    PlusOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { message, Breadcrumb, theme, AutoComplete, Input, Space, List, Tag, Skeleton, Tooltip, Button, Row, Col, Drawer, Form, Modal, Typography, Alert } from 'antd';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import { type User } from "@prisma/client";
import { type NoticeType } from 'antd/es/message/interface';

const Tags = (user: User) => {
    return (
        <>
            {
                user.name && (<Tag color="blue">{user.name}</Tag>)
            }
        </>
    )
}

export default function User() {

    const router = useRouter();
    const [modal, contextHolder] = Modal.useModal();
    const context = api.useContext();
    const [messageApi, contextMessage] = message.useMessage();
    // Context
    const userSearchContext = context.user.search;

    // Form
    const [formUser] = Form.useForm();

    //User
    const { mutate: userCreate, isLoading: loadingUserCreate, isSuccess: isSuccessCreate } = api.user.create.useMutation();
    const { mutate: userDelete, isLoading: loadingUserDelete, isSuccess: isSuccessDelete } = api.user.delete.useMutation();
    const { mutate: userUpdate, isLoading: loadingUserUpdate, isSuccess: isSuccessUpdate } = api.user.update.useMutation();
    const { data: userSearchData, isLoading: loadingUserData, refetch: refetchUserData } = api.user.getAll.useQuery();

    const loadingMutation = loadingUserDelete || loadingUserUpdate || loadingUserCreate || loadingUserData;
    const successUserMutation = isSuccessCreate || isSuccessDelete || isSuccessUpdate;

    // Search
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchOptions, setSearchOptions] = useState<{ value: string, key: string, user: User }[]>([]);

    // User
    const [userId, setUserId] = useState<string>('');
    const [userOpen, setUserOpen] = useState<boolean>(false);

    // Methods
    const notification = (content: string, type: NoticeType) => {
        void messageApi.open({
            type,
            content,
        });
    };

    const handleRouteSimple = async (path: string): Promise<void> => {
        await router.push(
            {
                pathname: path,
                //query: { structureId: id },
            },
            undefined,
            { shallow: true },
        )
    }
    const {
        token: { colorBgContainer },
    } = theme.useToken();


    const getSearchOptions = async (value: string) => {
        if (value.length < 1) return;
        const items = await userSearchContext.fetch({
            limit: 20,
            value
        });
        setSearchOptions(items.map((item) => ({
            value: `${item.email} (${item.name})`,
            key: item.id,
            user: item,
        })));
    }
    // User Methods
    const onFinishUser = (values: { name: string, email: string }) => {
        const { name, email } = values;
        const params = {
            name,
            email
        };
        if (userId !== '') {
            userUpdate({
                id: userId,
                data: params
            }, {
                onSuccess: () => {
                    notification('User updated', 'success');
                },
                onError: () => {
                    notification('User not updated', 'error');
                }
            });
        }
        else {
            userCreate(params, {
                onSuccess: () => {
                    notification('User created', 'success');
                },
                onError: () => {
                    notification('User not created', 'error');
                }
            });
        }
        onCloseUser();
    };
    const onDeleteUser = () => {
        userDelete(userId, {
            onSuccess: () => {
                notification('User deleted', 'success');
            },
            onError: () => {
                notification('User not deleted', 'error');
            }
        });
        onCloseUser();
    };
    const onCloseUser = () => {
        setUserOpen(false);
        formUser.resetFields();
    };
    const onSearchUser = (user: User) => {
        console.log('onSearchUser', user);
        setFormData(user)
    };
    const setFormData = (user: User) => {
        const { id, name, email } = user;
        setUserId(id);
        formUser.setFieldsValue(
            {
                name,
                email,
            }
        )
        setUserOpen(true)
    };
    const confirm = () => {
        void modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Do you want to delete this user?',
            onCancel: () => onCloseUser(),
            onOk: () => onDeleteUser(),
        });
    };

    useEffect(() => {
        if (successUserMutation) {
            void refetchUserData();
        }
    }, [successUserMutation]);

    return (
        <>
            <Breadcrumb items={[
                {
                    title: <a onClick={() => { handleRouteSimple('/').catch(console.error) }}>Home</a>,
                },
                {
                    title: 'Users',
                },
            ]} />
            <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                <Row gutter={[16, 16]}>
                    <Col xs={{ span: 20 }} sm={{ span: 22 }} md={{ span: 12 }} lg={{ span: 6 }} xl={{ span: 4 }}>
                        <AutoComplete
                            style={{ width: '100%' }}
                            value={searchValue}
                            options={searchOptions}
                            onSearch={(text) => {
                                void getSearchOptions(text);
                            }}
                            onChange={(e) => setSearchValue(e)}
                            onSelect={(value: string, option) => {
                                onSearchUser(option.user);
                            }}
                        >
                            <Input.Search size="large" placeholder="User Serach" />
                        </AutoComplete>
                    </Col>
                    <Col xs={{ span: 4 }} sm={{ span: 2 }} md={{ span: 12 }} lg={{ span: 4 }} xl={{ span: 4 }}>
                        <Space.Compact block>
                            <Button
                                size='large'
                                type="primary"
                                ghost
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setUserId('');
                                    setUserOpen(true);
                                }}
                            />
                        </Space.Compact>
                    </Col>
                </Row>
                <List
                    loading={loadingMutation}
                    dataSource={userSearchData}
                    pagination={{ position: 'bottom', pageSize: 10 }}
                    renderItem={(user: User) => (
                        <Skeleton loading={loadingMutation} active >
                            <List.Item key={user.id}>
                                <List.Item.Meta
                                    title={<a onClick={() => setFormData(user)}>{user.email}</a>}
                                    description={Tags(user)}
                                />
                                <Tooltip title="Edit">
                                    <Button
                                        onClick={() => setFormData(user)}
                                        type="text"
                                        shape="circle"
                                        icon={<MoreOutlined />}
                                    />
                                </Tooltip>
                            </List.Item>
                        </Skeleton>
                    )}
                />
            </div>
            {/* User Drawer */}
            <Drawer
                title="User"
                width={650}
                onClose={onCloseUser}
                open={userOpen}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={confirm}
                            disabled={userId === ''}
                        />
                        <Button onClick={onCloseUser}>Cancel</Button>
                        <Button onClick={() => formUser.submit()} type="primary">
                            Submit
                        </Button>
                    </Space>
                }
                footer={
                    <Typography>
                        <pre>{userId}</pre>
                    </Typography>
                }
            >
                <Form
                    form={formUser}
                    layout="vertical"
                    onFinish={onFinishUser}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Name"
                                rules={[{ required: true, message: 'Please enter user name' }]}
                                tooltip="User display name"
                            >
                                <Input
                                    placeholder="Please enter unique name"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Please User Email', type: 'email' }]}
                                tooltip="User Email"
                            >
                                <Input
                                    placeholder="Please enter user email"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Alert message="⚠️ Disclaimer message" type="warning" />
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
            {contextHolder}
            {contextMessage}
        </>
    );
};