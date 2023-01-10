import React, { useState, useReducer } from "react";
import { Modal, message, Space, Button, Form, Input, Select, AutoComplete } from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import { useCreatePurchaseInvoice, useSupplierList } from "../../api/purchase";
import { useProductList } from "../../api/product";
import { useHeaderList } from "../../api/account";
import StockPurchaseTable from "./StockPurchaseTable";
import OtherPurchaseTable from "./OtherPurchaseTable";
import { roundToTwo } from "../../utils";
const { Option } = Select;

function itemsReducer(stockItems, action) {
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
            if (stockItems.length > 1) {
                return stockItems.filter((element) => element.key !== action.key);
            }
            return stockItems;
        }

        case "ADD_ITEM": {
            return [...stockItems, {
                key: stockItems.length + 1,
                itemCode: null,
                quantity: 1,
                itemTotal: 0,
            }];
        }

        case "UPDATE_ITEM_FIELD": {
            return stockItems.map((element) => {
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
            return stockItems;
    }
};

function ManualInvoiceModal({ visible, hideInvoice }) {
    const [form] = Form.useForm();
    const [filterOptions, setFilterOptions] = useState([]);
    const [purchaseType, setPurchaseType] = useState("02");
    const [stockItems, dispatchStockItems] = useReducer(itemsReducer, [{
        key: 1,
        itemCode: null,
        quantity: 1,
        itemTotal: 0,
        searchValue: null,
    }]);
    const { isLoading: isLoadingOptions, data: options } = useProductList({
        onSuccess: (data) => setFilterOptions(data),
    });
    const { isLoading: isLoadingSuppliers, data: suppliers } = useSupplierList();
    const { data: headers } = useHeaderList({});
    const [supplierOptions, setSupplierOptions] = useState([]);
    const { mutate: createInvoice, isLoading: isLoadingCreateInvoice } = useCreatePurchaseInvoice({
        onSuccess: (response) => {
            Modal.success({
                content: response.data,
                onOk: handleClose,
            });
        }
    });
    const handleCreateInvoice = (values) => {
        let itemNotFilled = stockItems?.some((item) => (item.itemTotal === 0 || item.itemCode === null));
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
            invoice_total: roundToTwo(stockItems?.reduce((invoiceTotal, item) => invoiceTotal + item.itemTotal, 0)),
            supplier_name: values.supplierName,
            supplier_GSTIN: values.supplierGSTIN,
            items: stockItems.map((item) => ({
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

    const handlePurchaseType = (selectedValue) => {
        setPurchaseType(selectedValue);
    };

    const handleClose = () => {
        dispatchStockItems({ type: "RESET" });
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
            width={1000}
        >

            <Form
                name="manual-purchase"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 14 }}
                initialValues={{ remember: false, headerType: "regular", purchaseType: "02" }}
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
                <Form.Item
                    label="Purchase type"
                    name="purchaseType"
                    defaultValue="02"
                    rules={[{ required: true, message: 'Please select one!' }]}
                >
                    <Select
                        onSelect={handlePurchaseType}
                    >
                        {headers?.map((header) =>
                            <Option key={header.code} value={header.code}>{header.name}</Option>)}
                    </Select>
                </Form.Item>
            </Form>

            {purchaseType === "02" ?
                <StockPurchaseTable
                    items={stockItems}
                    dispatchItems={dispatchStockItems}
                    options={options ?? []}
                    filterOptions={filterOptions}
                    setFilterOptions={setFilterOptions}
                /> :
                <OtherPurchaseTable />
            }

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
