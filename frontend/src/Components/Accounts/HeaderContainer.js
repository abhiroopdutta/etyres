import React, { useState } from "react";
import styles from "./HeaderContainer.module.css";
import { message, Modal, Form, Input, Layout, Select, Button } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useCreateHeader } from "../../api/accounts";
const { Option } = Select;

function HeaderContainer({ headers, selectedHeader, setSelectedHeader }) {
    const [visible, setVisible] = useState(false);
    const { mutate: createHeader, isLoading: isLoadingCreateHeader } = useCreateHeader({
        onSuccess: (response) => {
            setVisible(false);
            setTimeout(() => message.success("Header created!", 2), 700);
        },
    });
    const closeModal = () => {
        setVisible(false);
    };
    const showModal = () => {
        setVisible(true);
    };

    const handleAddHeader = (formData) => {
        createHeader(formData)
    };

    const handleSetSelectedHeader = (header) => {
        setSelectedHeader(header);
    };

    return (
        <div className={styles["entities-container"]}>
            <header>
                <div className={styles["entities-header"]}>
                    <h5 className={styles["entities-title"]}>Headers</h5>
                    <Button
                        className={styles["add-entity-btn"]}
                        onClick={showModal}
                        type="default"
                    >+</Button>

                </div>
                <div className={styles["entities-search"]}>
                    <label htmlFor="search-box"></label>
                    <input id="search-box" type="text" placeholder="Find or search headers" />
                    <SearchOutlined />
                </div>
            </header>


            <section className={styles["entities-section-container"]}>
                <div className={styles["entities"]}>
                    {headers.map((header) => (
                        <div key={header.code}>
                            <div
                                className={selectedHeader?.code === header.code ?
                                    `${styles["entity-container"]} ${styles["active"]}` :
                                    `${styles["entity-container"]}`
                                }
                                onClick={() => handleSetSelectedHeader(header)}>
                                <h4>{header.name}</h4>
                                <InfoCircleOutlined className={styles["info-icon"]} />
                            </div>
                        </div>
                    ))}

                </div>
            </section>
            <Modal
                visible={visible}
                centered
                destroyOnClose
                onCancel={closeModal}
                footer={null}
                title="Add Header"
                bodyStyle={{
                    backgroundColor: "var(--lighter)",
                    borderRadius: "12px"
                }}
            >
                <Layout
                    style={{
                        margin: "15px auto",
                    }}
                >
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={handleAddHeader}
                        autoComplete="off"
                        initialValues={{ remember: false, headerType: "regular" }}
                    >
                        <Form.Item
                            label="Header Name"
                            name="headerName"
                            rules={[{ required: true, message: 'Please input header name!' }]}
                        >
                            <Input placeholder="ex - Electricity/Rent" />
                        </Form.Item>

                        <Form.Item
                            label="Header Type"
                            name="headerType"
                            rules={[{ required: true, message: 'Please input header type!' }]}
                        >
                            <Select style={{ width: 120 }}>
                                <Option value="cash">Cash</Option>
                                <Option value="bank">Bank</Option>
                                <Option value="regular">Regular</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{
                            margin: "0",
                        }}>
                            <Button loading={isLoadingCreateHeader} type="primary" htmlType="submit">
                                Add header
                            </Button>
                        </Form.Item>
                    </Form>

                </Layout>
            </Modal>
        </div>

    );
}

export default HeaderContainer;
