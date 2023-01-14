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
    const [selectedHeader, setSelectedHeader] = useState();

    const { data: headers } = useHeaderList({
        onSuccess: (result) => setSelectedHeader(result[0]),
        onError: (err) => Modal.error({ content: err.message }),
    });

    const [form] = Form.useForm();
    const headerOptions = headers?.filter(header => {
        return !["02", "03", "06"].includes(header.code);
    }).map(header => ({ label: header.name, value: header.code }));
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

    const transactionFrom = Form.useWatch('transactionFrom', form);
    const transactionTo = Form.useWatch('transactionTo', form);
    let transactionFromType = headers?.find(header => header.code === transactionFrom?.value)?.type;
    let transactionToType = headers?.find(header => header.code === transactionTo?.value)?.type;
    let paymentOptions;
    if (transactionFromType === "cash" || transactionToType === "cash") {
        paymentOptions = ["cash"];
    }
    else {
        paymentOptions = ["cash", "card", "UPI", "bankTransfer", "creditNote"];
    }

    const handleAddTransaction = (formData) => {
        if (formData.transactionFrom.value === formData.transactionTo.value) {
            message.warning("Transaction cannot take place between same header!", 3);
            return;
        }
        createTransaction({
            ...formData,
            transactionFrom: formData.transactionFrom.value,
            transactionTo: formData.transactionTo.value,
            dateTime: dayjsLocal(formData["dateTime"]).format("YYYY-MM-DD HH:mm:ss")
        });
        form.resetFields();
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
            >
                <Layout
                    style={{
                        margin: "15px auto",
                    }}
                >
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={handleAddTransaction}
                        autoComplete="off"
                        initialValues={{ remember: false, status: "paid", description: "" }}
                    >
                        <Form.Item
                            label="From"
                            name="transactionFrom"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select options={headerOptions} labelInValue>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="To"
                            name="transactionTo"
                            rules={[{ required: true, message: 'Please select one!' }]}
                        >
                            <Select options={headerOptions} labelInValue>
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
                                {paymentOptions.map((paymentMode) =>
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
