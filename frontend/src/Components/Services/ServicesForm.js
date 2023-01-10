import React, { useReducer } from "react";
import { Button, Input, Form, Layout, Typography, Divider, message, Select, Space } from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import {
    FileAddOutlined,
    ClearOutlined,
    DeleteOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { dayjsLocal } from "../dayjsUTCLocal";
import { useCreateServiceInvoice } from "../../api/service";
const { Option } = Select;
const { Title } = Typography;
function itemsReducer(items, action) {
    switch (action.type) {
        case "RESET": {
            return [{
                key: 1,
                service: null,
                price: 0,
                quantity: 1,
            }];
        }
        case "DELETE_ITEM": {
            if (items.length > 1) {
                return items.filter((element) => element.key !== action.key);
            }
            return items;
        }

        case "ADD_ITEM": {
            return [...items, {
                key: items.length + 1,
                service: null,
                price: 0,
                quantity: 1,
            }];
        }

        case "UPDATE_ITEM_FIELD": {
            return items.map((element) => {
                if (element.key === action.key) {
                    return {
                        ...element,
                        [action.field]: action.value,
                    };
                }
                return element;
            });
        }

        default:
            return items;
    }
};
function ServicesForm() {
    const [form] = Form.useForm();
    const serviceOptions = [
        {
            label: "Fitting",
            value: "fitting",
        },
        {
            label: "Balancing",
            value: "balancing",
        },
        {
            label: "Weight",
            value: "weight",
        },
        {
            label: "Alignment",
            value: "alignment",
        },
        {
            label: "Puncture",
            value: "puncture",
        },
        {
            label: "Air/Nitrogen",
            value: "air",
        },
        {
            label: "Old Tyre",
            value: "oldTyre",
        },
        {
            label: "Valve (2W)",
            value: "valve",
        },
    ];
    const [items, dispatchItems] = useReducer(itemsReducer, [{
        key: 1,
        name: null,
        price: 0,
        quantity: 1,
    }]);
    let filteredServiceOptions = serviceOptions.filter((option) => {
        return !items.map(item => item.service?.value).includes(option.value);
    });
    const { mutate: createInvoice, isLoading: isLoadingCreateInvoice } = useCreateServiceInvoice({
        onSuccess: (response) => {
            message.success(
                response.data, 3
            );
            emptyCart();
        },
        onError: (response) => message.error(response.response.data.status, 3),
    });

    let serviceTotal = Math.round(items.reduce(
        (serviceTotal, service) =>
            serviceTotal + service.price * service.quantity,
        0
    ));

    const handleFocus = (e) => e.target.select();

    const emptyCart = () => {
        form.resetFields();
        dispatchItems({ type: "RESET" });
    };
    const handleCreateInvoice = (values) => {
        if (items.every((item) => (item.quantity === 0 || item.price === 0))) {
            message.error("No items added! Please add atleast one item with non zero price, quantity.", 3);
            return;
        }
        createInvoice({
            invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
            paymentMode: values.paymentMode,
            invoiceTotal: serviceTotal,
            vehicleNumber: values.vehicleNumber,
            vehicleDesc: values.vehicleDesc,
            noTaxItems: items.map(item => ({ ...item, name: item.service.value })),
        });
    };
    console.log(items);
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
                initialValues={{ invoiceDate: dayjsLocal(), paymentMode: "cash" }}
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
                    label="Payment mode"
                    name="paymentMode"
                    style={{ margin: "10px 0" }}
                    rules={[{ required: true, message: 'Please select one!' }]}
                >
                    <Select
                    >
                        <Option value="cash">Cash</Option>
                        <Option value="UPI">UPI</Option>
                    </Select>
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
            <Title level={5}>Items</Title>
            <Divider style={{ margin: "5px 0 15px 0", border: "1px solid var(--dark)" }} />

            <Form
                name="noTaxItems-form"
            >
                {items.map(({ key, service, price, quantity }) =>
                    <Space
                        key={key}
                        style={{
                            display: 'flex',
                            alignItems: "flex-start",
                            columnGap: "15px"
                        }}
                    >
                        <Form.Item
                            rules={[{ required: true, message: 'Please input service name!' }]}
                        >
                            <Select
                                placeholder="Select a service"
                                style={{ minWidth: "140px" }}
                                value={service}
                                onChange={(value, option) => dispatchItems({
                                    type: "UPDATE_ITEM_FIELD",
                                    key: key,
                                    field: "service",
                                    value: option,
                                })}
                                options={filteredServiceOptions}
                            >
                            </Select>
                        </Form.Item>
                        <Form.Item
                        >
                            <Input
                                placeholder="Price"
                                onFocus={handleFocus}
                                type="number"
                                min="0"
                                addonBefore="&#8377;"
                                value={price}
                                onChange={(e) => dispatchItems({
                                    type: "UPDATE_ITEM_FIELD",
                                    key: key,
                                    field: "price",
                                    value: Number(e.target.value)
                                })}
                            />
                        </Form.Item>
                        <Form.Item
                            value={quantity}
                        >
                            <Input
                                placeholder="Quantity"
                                onFocus={handleFocus}
                                type="number"
                                min="0"
                                step="1"
                                value={quantity}
                                onChange={(e) => dispatchItems({
                                    type: "UPDATE_ITEM_FIELD",
                                    key: key,
                                    field: "quantity",
                                    value: e.target.value === "" ? 1 : parseInt(e.target.value)
                                })}
                            />
                        </Form.Item>

                        <Button
                            icon={<DeleteOutlined style={{ color: "var(--lightest)" }} />}
                            style={{ maxWidth: "50px" }}
                            onClick={() => dispatchItems({ type: "DELETE_ITEM", key: key })}
                        >
                        </Button>
                    </Space>
                )}
                <Button
                    style={{
                        backgroundColor: "var(--lighter)",
                        color: "var(--darkest)",
                        border: "1px dashed var(--darkest)"
                    }}
                    onClick={() => dispatchItems({ type: "ADD_ITEM" })}
                    block
                    icon={<PlusOutlined />}
                >
                    Add item
                </Button>

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
