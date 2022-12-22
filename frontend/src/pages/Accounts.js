import React, { useState } from "react";
import { Layout, DatePicker, Button, Col, Row, Modal, Form, Input, Select, message } from "antd";
import { dayjsLocal } from "../Components/dayjsUTCLocal";
import HeaderContainer from "../Components/Accounts/HeaderContainer";
import TransactionTable from "../Components/Accounts/TransactionTable";
import { useCreateTransaction, useHeaderList } from "../api/account";
const { Option } = Select;
const { TextArea } = Input;

function Accounts() {
    const [visible, setVisible] = useState(false);
    const [paymentModes, setPaymentModes] = useState(["cash", "card", "UPI", "bankTransfer", "creditNote"]);
    const [selectedHeader, setSelectedHeader] = useState();

    const { data: headers } = useHeaderList({
        onSuccess: (result) => setSelectedHeader(result[0]),
        onError: (err) => Modal.error({ content: err.message }),
    });

    const { mutate: createTransaction, isLoading: isLoadingCreateTransaction } = useCreateTransaction({
        onSuccess: (response) => {
            setVisible(false);
            setTimeout(() => message.success("Transaction Added!", 2), 700);
        },
    });

    const closeModal = () => {
        setVisible(false);
    };
    const showModal = () => {
        setVisible(true);
    };

    const handleFilterPaymentModes = (changedFields, allFields) => {
        let fromFieldValue = allFields.find((field) => field.name[0] === "transactionFrom")?.value;
        let toFieldValue = allFields.find((field) => field.name[0] === "transactionTo")?.value;
        let fromFieldType = headers.find(header => header.code === fromFieldValue)?.type;
        let toFieldType = headers.find(header => header.code === toFieldValue)?.type;
        if (fromFieldType === "cash" || toFieldType === "cash") {
            setPaymentModes(["cash"]);
            return;
        }
        else {
            setPaymentModes(["cash", "card", "UPI", "bankTransfer", "creditNote"]);
        }
    };

    const handleAddTransaction = (formData) => {
        createTransaction({
            ...formData,
            dateTime: dayjsLocal(formData["dateTime"]).format("YYYY-MM-DD HH:mm:ss")
        });

    };

    return (
        <Layout
            style={{
                maxWidth: "95%",
                margin: "44px auto",
            }}
        >
            <Row justify={"center"}>
                <Col>
                    <Button
                        onClick={showModal}
                        style={{ marginBottom: "40px" }}
                        type="primary"
                    >
                        + Add new transaction
                    </Button>
                </Col>
            </Row>
            <Row gutter={30}>
                <Col>
                    <HeaderContainer
                        headers={headers ?? []}
                        selectedHeader={selectedHeader}
                        setSelectedHeader={setSelectedHeader}
                    />
                </Col>
                <Col flex={"auto"}>
                    <TransactionTable headers={headers} selectedHeader={selectedHeader} />
                </Col>
            </Row>

            <Modal
                visible={visible}
                centered
                destroyOnClose
                onCancel={closeModal}
                footer={null}
                title="Add new transaction"
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
                        onFinish={handleAddTransaction}
                        autoComplete="off"
                        initialValues={{ remember: false, status: "paid", description: "" }}
                        onFieldsChange={handleFilterPaymentModes}
                    >
                        <Form.Item
                            label="From"
                            name="transactionFrom"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                {headers?.map((header) =>
                                    <Option key={header.code} value={header.code}>{header.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="To"
                            name="transactionTo"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                {headers?.map((header) =>
                                    <Option key={header.code} value={header.code}>{header.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Amount"
                            name="amount"
                            rules={[{ required: true, message: 'Please input transaction amount!' }]}
                        >
                            <Input placeholder="ex - Rs 500/-" type="number" min="1" step="1" addonBefore="&#8377;" />
                        </Form.Item>
                        <Form.Item
                            label="Date Time"
                            name="dateTime"
                            rules={[{ required: true, message: 'Please input transaction datetime!' }]}
                        >
                            <DatePicker
                                format="YYYY-MM-DD HH:mm:ss"
                                showTime={true}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Payment Mode"
                            name="paymentMode"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select
                            >
                                {paymentModes.map((paymentMode) =>
                                    <Option key={paymentMode} value={paymentMode}>{paymentMode}</Option>
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select >
                                <Option value="paid">paid</Option>
                                <Option value="due">due</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: false }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{
                            margin: "0",
                        }}>
                            <Button loading={isLoadingCreateTransaction} type="primary" htmlType="submit">
                                Add transaction
                            </Button>
                        </Form.Item>
                    </Form>

                </Layout>
            </Modal>
        </Layout>
    );
}

export default Accounts;
