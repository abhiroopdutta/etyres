import React, { useMemo, useState } from "react";
import { Modal, Table, Typography, Space, Layout, Divider, Button, Form, Input, Select, DatePicker } from "antd";
import {
    DeleteOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function ManualInvoiceModal({ visible, hideInvoice }) {
    const [filteredOptions, setFilterOptions] = useState([]);
    const [numberOfItems, setNumberOfItems] = useState([{
        key: 1,
        itemCode: null,
        quantity: "",
        itemTotal: "",
        searchValue: null,
    }]);
    const { isLoading: isLoadingOptions, isError, data: options, error } = useQuery({
        queryKey: ["products"],
        queryFn: () => axios.get("/api/data"),
        select: (data) => {
            let result = data.data;
            return result.map(item => ({
                ...item,
                label: item.itemDesc,
                value: item.itemCode,
            }));
        },
        placeholder: [],
        onSuccess: (data) => setFilterOptions(data),
    })
    const columns = useMemo(
        () => [
            {
                title: "Item Desc",
                dataIndex: "itemDesc",
                key: "itemDesc",
                // width: 300,
            },
            {
                title: "Item Code",
                dataIndex: "itemCode",
                key: "itemCode",
            },
            {
                title: "Qty",
                dataIndex: "quantity",
                key: "quantity",
            },
            {
                title: "Taxable Value",
                dataIndex: "taxableValue",
                key: "taxableValue",
            },
            {
                title: "Tax",
                dataIndex: "tax",
                key: "tax",
            },
            {
                title: "Item Total",
                dataIndex: "itemTotal",
                key: "itemTotal",
            },
            {
                title: "Action",
                dataIndex: "action",
                key: "action",
            },
        ],
        []
    );

    const handleSearch = (newValue, key) => {
        if (!isLoadingOptions && newValue) {
            setFilterOptions(options.filter((i) => {
                return i.size.toString().match(newValue);
            }));
        }
        setNumberOfItems(prevState => {
            return prevState.map((element) => {
                if (element.key === key) {
                    return {
                        ...element,
                        searchValue: newValue,
                    }
                }
                return element;
            });
        })
        if (newValue !== "") {
            setNumberOfItems(prevState => {
                return prevState.map((element) => {
                    if (element.key === key) {
                        return {
                            ...element,
                            itemCode: null,
                        }
                    }
                    return element;
                });
            })
        }
    };
    const inputList = numberOfItems.map((item) => ({
        key: item.key,
        itemDesc:
            <Select
                showSearch
                value={item.itemCode}
                placeholder="Search tyres by entering size or name"
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={(newValue) => handleSearch(newValue, item.key)}
                onChange={(value) => setNumberOfItems(prevState => {
                    return prevState.map((element) => {
                        if (element.key === item.key) {
                            return {
                                ...element,
                                itemCode: value,
                            }
                        }
                        return element;
                    });
                })}
                notFoundContent={null}
                options={filteredOptions}
                allowClear
                searchValue={item.searchValue}
            />,
        quantity: <Input />,
        itemTotal: <Input />,
        action: item.key === 1 ? null : <Button
            icon={<DeleteOutlined />}
            onClick={() =>
                setNumberOfItems(prevState => {
                    if (prevState.length > 1) {
                        return prevState.filter((element) => element.key !== item.key)
                    }
                    return prevState;
                }
                )}
        >
        </Button>
    }))

        ;
    return (
        <Modal
            visible={visible}
            destroyOnClose={true}
            onCancel={hideInvoice}
            footer={null}
            title="Create purchase invoice"
            bodyStyle={{
                backgroundColor: "var(--lighter)",
                borderRadius: "12px"
            }}
            width={1000}
        >
            <Layout
            >
                <Form
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    // onFinish={handleAddHeader}
                    autoComplete="off"
                    initialValues={{ remember: false, headerType: "regular" }}
                >
                    <Form.Item
                        label="Invoice No"
                        name="invoiceNumber"
                        rules={[{ required: true, message: 'Please enter invoice number!' }]}
                    >
                        <Input placeholder="ex - 133574165" />
                    </Form.Item>
                    <Form.Item
                        label="Invoice Date"
                        name="invoiceDate"
                        rules={[{ required: true, message: 'Please enter invoice date!' }]}
                    >
                        <DatePicker />
                    </Form.Item>
                    <Form.Item
                        label="Supplier Name"
                        name="supplierName"
                        rules={[{ required: true, message: 'Please enter supplier name' }]}
                    >
                        <Input placeholder="ex - ABC Tyres" />
                    </Form.Item>
                    <Form.Item
                        label="Supplier GSTIN"
                        name="supplierGSTIN"
                        rules={[{ required: true, message: 'Please enter supplier GSTIN' }]}

                    >
                        <Input placeholder="ex - 09AAACA6990Q1ZW" />
                    </Form.Item>
                </Form>
                <Table
                    columns={columns}
                    dataSource={inputList}
                    rowKey={(item) => item.key}
                    pagination={false}
                    style={{ display: "flex", justifyContent: "center" }}
                />
                <Button
                    type="primary"
                    onClick={() => setNumberOfItems(prevState =>
                        [...prevState, {
                            key: prevState.length + 1,
                            itemCode: null,
                            quantity: "",
                            itemTotal: "",
                        }])}
                >
                    Add item
                </Button>

                <Form.Item wrapperCol={{ offset: 10, span: 14 }} style={{
                    margin: "10px 0 0 0",
                }}>
                    <Button type="primary" htmlType="submit">
                        Create invoice
                    </Button>
                </Form.Item>
            </Layout>
        </Modal>
    );
}

export default ManualInvoiceModal;
