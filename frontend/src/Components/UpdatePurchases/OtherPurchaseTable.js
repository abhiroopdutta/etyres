import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
const OtherPurchaseTable = () => {
    const onFinish = (values) => {
        console.log('Received values of form:', values);
    };
    return (
        <Form name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
            <Form.List name="users">
                {(fields, { add, remove }) => (
                    <>
                        <h4>Items</h4>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space
                                key={key}
                                style={{
                                    display: 'flex',
                                    marginBottom: 8,
                                }}
                                align="baseline"
                            >
                                <Form.Item
                                    {...restField}
                                    name={[name, 'itemDesc']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing first name',
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{ minWidth: "200px" }}
                                        placeholder="Item Description" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'HSN']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="HSN" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'quantity']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{ maxWidth: "80px" }}
                                        placeholder="Qty" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'CGST']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{ maxWidth: "80px" }}
                                        placeholder="CGST %" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'SGST']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{ maxWidth: "80px" }}
                                        placeholder="SGST %" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'IGST']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input
                                        style={{ maxWidth: "80px" }}
                                        placeholder="IGST %" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'itemTotal']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Missing last name',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Item Total (incl. GST)" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add item
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </Form>
    );
};
export default OtherPurchaseTable;