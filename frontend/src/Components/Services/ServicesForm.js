import React, { useState } from "react";
import { Modal, Button, Input, Form, Layout, Col, Row, Typography, Divider, message } from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import axios from "axios";
import {
    FileAddOutlined,
    ClearOutlined
} from "@ant-design/icons";
const { Title } = Typography;

function ServicesForm() {
    const [form] = Form.useForm();
    const [noTaxItems, setNoTaxItems] = useState([
        {
            label: "Fitting",
            name: "fitting",
            quantity: 0,
            price: 0,
        },
        {
            label: "Balancing",
            name: "balancing",
            quantity: 0,
            price: 0,
        },
        {
            label: "Weight",
            name: "weight",
            quantity: 0,
            price: 0,
        },
        {
            label: "Alignment",
            name: "alignment",
            quantity: 0,
            price: 0,
        },
        {
            label: "Puncture",
            name: "puncture",
            quantity: 0,
            price: 0,
        },
        {
            label: "Air/Nitrogen",
            name: "air",
            quantity: 0,
            price: 0,
        },
        {
            label: "Old Tyre",
            name: "oldTyre",
            quantity: 0,
            price: 0,
        },
    ]);
    const { mutate: createInvoice, isLoading: isLoadingCreateInvoice } = useMutation({
        mutationFn: postBody => {
            return axios.post('/api/notax/invoices', postBody);
        },
        onSuccess: (response) => {
            Modal.success({
                content: response.data,
            });
            emptyCart();
            //invalidate query

        }
    });
    let serviceTotal = Math.round(noTaxItems.reduce(
        (serviceTotal, service) =>
            serviceTotal + service.price * service.quantity,
        0
    ));

    const handleServicesPrice = (e) => {
        let fieldName = e.target.getAttribute("fieldname");
        let value = fieldName === "price" ? Number(e.target.value) : e.target.value ? parseInt(e.target.value) : 0
        setNoTaxItems((noTaxItems) =>
            noTaxItems.map((service) => {
                if (service.name === e.target.name) {
                    const updatedService = {
                        ...service,
                        [fieldName]: value,
                    };
                    return updatedService;
                }
                return service;
            })
        );
    };

    const handleFocus = (e) => e.target.select();

    const emptyCart = () => {
        form.resetFields();
        setNoTaxItems((noTaxItems) =>
            noTaxItems.map((service) => {
                return {
                    ...service,
                    quantity: 0,
                    price: 0,
                };
            })
        );
    };

    const handleCreateInvoice = (values) => {
        if (noTaxItems.every((item) => (item.quantity === 0 || item.price === 0))) {
            message.error("No items added! Please add atleast one item with non zero price, quantity.", 3);
            return;
        }
        createInvoice({
            invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
            invoiceTotal: serviceTotal,
            vehicleNumber: values.vehicleNumber,
            vehicleDesc: values.vehicleDesc,
            noTaxItems: noTaxItems.filter((item) => item.quantity > 0),
        });
    };

    return (
        <Layout style={{ backgroundColor: "var(--lighter)", borderRadius: "12px", padding: "22px", marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={3}>SERVICES</Title>
                <Button
                    icon={<ClearOutlined />}
                    onClick={emptyCart}
                >
                    Clear
                </Button>
            </div>
            <Divider style={{ margin: "5px 0 15px 0", border: "1px solid var(--dark)" }} />
            <Form
                name="noTaxItems-vehicleDetails-form"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={handleCreateInvoice}
                form={form}
            >
                <Form.Item
                    label="Invoice Date"
                    name="invoiceDate"
                    style={{ margin: "10px 0" }}
                    rules={[{ required: true, message: 'Please enter invoice date!' }]}
                >
                    <DatePicker />
                </Form.Item>
                <Form.Item
                    label="Vehicle No."
                    name="vehicleNumber"
                    style={{ margin: "10px 0" }}
                >
                    <Input placeholder="ex - UP70DC9023" />
                </Form.Item>
                <Form.Item
                    label="Vehicle Desc"
                    style={{ margin: "10px 0" }}
                    name="vehicleDesc"

                >
                    <Input placeholder="ex - Santro" />
                </Form.Item>
            </Form>
            <Form
                name="noTaxItems-form"
                labelAlign="right"
            >
                {noTaxItems.map((service) =>
                    <React.Fragment key={service.name}>
                        <Row>
                            <Col>
                                <h4 style={{ margin: "0" }}>{service.label}</h4>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col lg={12}>
                                <Form.Item label="Price"
                                    style={{ margin: "8px 0" }}
                                >
                                    <Input
                                        name={service.name}
                                        fieldname="price"
                                        value={service.price}
                                        onChange={handleServicesPrice}
                                        onFocus={handleFocus}
                                        type="number"
                                        min="0"
                                        addonBefore="&#8377;"
                                    />
                                </Form.Item>
                            </Col>
                            <Col lg={12}>
                                <Form.Item label="Qty"
                                    style={{ margin: "8px 0" }}
                                >
                                    <Input
                                        name={service.name}
                                        fieldname="quantity"
                                        value={service.quantity}
                                        onChange={handleServicesPrice}
                                        onFocus={handleFocus}
                                        type="number"
                                        min="0"
                                        step="1"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </React.Fragment>
                )}
            </Form>
            <Title style={{ margin: "10px 0" }} level={3}>TOTAL: &#x20B9;{serviceTotal}</Title>
            <Button
                icon={<FileAddOutlined />}
                onClick={() => form.submit()}
                loading={isLoadingCreateInvoice}
            >
                Create service invoice
            </Button>

        </Layout >
    );
}

export default ServicesForm;
