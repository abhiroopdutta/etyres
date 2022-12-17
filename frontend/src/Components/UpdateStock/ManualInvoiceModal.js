import React, { useMemo, useState, useReducer } from "react";
import { Modal, Table, message, Space, Button, Form, Input, Select, AutoComplete } from "antd";
import {
    DeleteOutlined,
} from "@ant-design/icons";
import { DatePicker } from "../Antdesign_dayjs_components";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
}
function itemsReducer(items, action) {
    switch (action.type) {
        case "RESET": {
            return [{
                key: 1,
                itemCode: null,
                quantity: 1,
                itemTotal: 0,
                searchValue: null,
            }];
        }
        case "DELETE_ITEM": {
            if (items.length > 1) {
                return items.filter((element) => element.key !== action.key)
            }
            return items;
        }

        case "ADD_ITEM": {
            return [...items, {
                key: items.length + 1,
                itemCode: null,
                quantity: 1,
                itemTotal: 0,
            }]
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
    }
};

function ManualInvoiceModal({ visible, hideInvoice }) {
    const [form] = Form.useForm();
    const [filteredOptions, setFilterOptions] = useState([]);
    const [items, dispatchItems] = useReducer(itemsReducer, [{
        key: 1,
        itemCode: null,
        quantity: 1,
        itemTotal: 0,
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
    });
    const { isLoading: isLoadingSuppliers, isError: isErrorSuppliers, data: suppliers, error: errorSupplier } = useQuery({
        queryKey: ["suppliers"],
        queryFn: () => axios.get("/api/suppliers"),
        select: (data) => data.data.map(supplier => ({
            label: supplier.name,
            value: supplier.name,
            GSTIN: supplier.GSTIN,
        })),
        placeholder: [],
    });
    const [supplierOptions, setSupplierOptions] = useState([]);
    const { mutate: createInvoice, isLoading: isLoadingCreateInvoice } = useMutation({
        mutationFn: postBody => {
            return axios.post('/api/purchases/invoices', postBody);
        },
        onSuccess: (response) => {
            Modal.success({
                content: response.data,
                onOk: handleClose,
            });

        }
    });
    const handleCreateInvoice = (values) => {
        let itemNotFilled = items?.some((item) => (item.itemTotal === 0 || item.itemCode === null));
        if (itemNotFilled) {
            message.error(
                "Please fill all item details before submitting",
                3
            );
            return;
        }
        createInvoice([{
            invoice_number: values.invoiceNumber,
            invoice_date: values.invoiceDate.format("YYYY-MM-DD"),
            invoice_total: roundToTwo(items?.reduce((invoiceTotal, item) => invoiceTotal + item.itemTotal, 0)),
            supplier_name: values.supplierName,
            supplier_GSTIN: values.supplierGSTIN,
            items: items.map((item) => ({
                item_code: item.itemCode,
                quantity: item.quantity,
                item_total: item.itemTotal,
            })),
            claim_invoice: false,
            claim_items: [],
            overwrite_price_list: false,
            special_discount: false,
        }]);
    };

    const handleSearchSupplierName = (searchText) => {
        if (!isLoadingSuppliers) {
            setSupplierOptions(
                !searchText ? [] :
                    suppliers.filter((supplier) => supplier.label.toLowerCase().match(searchText.toLowerCase())),
            );
        }
    };
    const handleSelectSupplierName = (selectedSupplierGSTIN, selectedSupplier) => {
        form.setFieldsValue({
            supplierName: selectedSupplier.label,
            supplierGSTIN: selectedSupplier.GSTIN
        });
    };
    const columns = useMemo(
        () => [
            {
                title: "Item Desc",
                dataIndex: "itemDesc",
                key: "itemDesc",
                render: (itemDesc, item) =>
                    item.itemDesc === "TOTAL" ? <h4>{itemDesc}</h4> : itemDesc,
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
        dispatchItems({
            type: "UPDATE_ITEM_FIELD",
            key: key,
            field: "searchValue",
            value: newValue,
        });

        if (newValue !== "") {
            dispatchItems({
                type: "UPDATE_ITEM_FIELD",
                key: key,
                field: "itemCode",
                value: null,
            });
        }
    };
    const inputList = items.map((item) => ({
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
                onChange={(value) => dispatchItems({
                    type: "UPDATE_ITEM_FIELD",
                    key: item.key,
                    field: "itemCode",
                    value: value,
                })}
                notFoundContent={null}
                options={filteredOptions}
                allowClear
                searchValue={item.searchValue}
                style={{ minWidth: "400px" }}
            />,
        itemCode: item.itemCode,
        quantity:
            <Input
                type="number"
                value={item.quantity}
                step="1"
                min="1"
                onChange={(e) => dispatchItems({
                    type: "UPDATE_ITEM_FIELD",
                    key: item.key,
                    field: "quantity",
                    value: e.target.value === "" ? 1 : parseInt(e.target.value)
                })}
            />,
        itemTotal:
            <Input
                type="number"
                value={item.itemTotal}
                onChange={(e) => dispatchItems({
                    type: "UPDATE_ITEM_FIELD",
                    key: item.key,
                    field: "itemTotal",
                    value: Number(e.target.value)
                })}
            />,
        action: item.key === 1 ? null : <Button
            icon={<DeleteOutlined />}
            onClick={() => dispatchItems({
                type: "DELETE_ITEM",
                key: item.key,
            })}
        >
        </Button>
    }));

    const totalRow = {
        key: "total",
        itemDesc: <h3 style={{ padding: "0" }}>TOTAL</h3>,
        itemCode: "",
        quantity:
            <h3 style={{ padding: "0 0 0 10px" }}>
                {roundToTwo(items?.reduce((totalQuantity, item) => totalQuantity + item.quantity, 0))}
            </h3>,
        itemTotal:
            <h3 style={{ padding: "0" }}>
                &#x20B9;{roundToTwo(items?.reduce((invoiceTotal, item) => invoiceTotal + item.itemTotal, 0))}
            </h3>,
        action: ""
    }

    const handleClose = () => {
        dispatchItems({ type: "RESET" });
        setFilterOptions([]);
        setSupplierOptions([]);
        form.resetFields();
        hideInvoice();
    };

    return (
        <Modal
            visible={visible}
            destroyOnClose={true}
            onCancel={handleClose}
            footer={null}
            title="Create purchase invoice"
            bodyStyle={{
                backgroundColor: "var(--lighter)",
                borderRadius: "12px"
            }}
            width={1000}
        >

            <Form
                name="manual-purchase"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 14 }}
                initialValues={{ remember: false, headerType: "regular" }}
                form={form}
                onFinish={handleCreateInvoice}
                id="manual-purchase-form"
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
                    <AutoComplete
                        placeholder="ex - ABC Tyres"
                        options={supplierOptions}
                        onSelect={handleSelectSupplierName}
                        onSearch={handleSearchSupplierName}
                    />
                </Form.Item>
                <Form.Item
                    label="Supplier GSTIN"
                    name="supplierGSTIN"
                    rules={[{ required: true, message: 'Please enter supplier GSTIN' }]}

                >
                    <Input
                        placeholder="ex - 09AAACA6990Q1ZW"
                        value="hello"
                    />
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={[...inputList, totalRow]}
                rowKey={(item) => item.key}
                pagination={false}
                style={{ display: "flex", justifyContent: "center" }}
            />
            <Space
                style={{ display: "flex", justifyContent: "flex-start", padding: "0 36px" }}

            >
                <Button
                    type="primary"
                    onClick={() => {
                        let itemNotFilled = items?.some((item) => (item.itemTotal === 0 || item.itemCode === null));
                        if (itemNotFilled) {
                            message.error(
                                "Please fill existing item fields before adding new items",
                                3
                            );
                            return;
                        }
                        dispatchItems({
                            type: "ADD_ITEM"
                        })
                    }
                    }
                >
                    + Add item
                </Button>,

            </Space>

            <Space
                style={{ display: "flex", justifyContent: "center", margin: "20px 0", width: "100%" }}
            >

                <Button type="primary" htmlType="submit" form="manual-purchase-form" loading={isLoadingCreateInvoice}>
                    Create invoice
                </Button>
            </Space>
        </Modal>
    );
}

export default ManualInvoiceModal;
