import React, { useState, useRef } from "react";
import {
    Table,
    Button,
    Space,
    Layout,
    Typography,
    message,
    Modal
} from "antd";
import {
    DownloadOutlined,
    DeleteFilled,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { getSearchMenu } from "../TableSearchFilter";
import { getDateRangeMenu } from "../TableDateFilter";
import { useDeleteServiceInvoice, useServiceInvoiceList } from "../../api/service";
const { Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

function PurchaseTable({ exportToExcel }) {
    const [query, setQuery] = useState({
        invoiceNumber: "",
        start: "",
        end: "",
        vehicleNumber: "",
        vehicleDesc: "",
        page: 1,
        page_size: 5,
    })
    const searchInputRef = useRef();

    const { isLoading: isLoadingServiceInvoices, data: serviceInvoices } = useServiceInvoiceList({ query: query });
    const { mutate: deleteInvoice } = useDeleteServiceInvoice({
        onSuccess: (response) => {
            message.success(
                "Invoice deleted!", 3
            );
        },
    });

    const handlePageChange = (pagination) => {
        let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
        if (itemsAlreadyRequested <= pagination.total)
            setQuery(oldState => ({ ...oldState, page: pagination.current }));
    };

    const handleExport = (exportType) => {
        exportToExcel({
            reportType: "purchase",
            exportType: exportType,
            query: {
                ...query,
                start: query.start ? query.start.format("YYYY-MM-DD") : "",
                end: query.end ? query.end.format("YYYY-MM-DD") : "",
                page: 1,
                page_size: 10000,
            }
        });
    };
    const showConfirm = (invoiceNumber) => {
        confirm({
            title: "Are you sure you want to cancel this invoice?",
            icon: <ExclamationCircleOutlined />,
            content:
                "This will reverse any transaction(s) associated with it.",

            onOk() {
                deleteInvoice(invoiceNumber);
            },

            onCancel() {
                console.log("Invoice Cancellation aborted");
            },
        });
    };
    const columns = [
        {
            title: "Invoice No.",
            dataIndex: "invoiceNumber",
            key: "invoiceNumber",
            ...getSearchMenu("invoiceNumber", searchInputRef, setQuery),
            render: (invoiceNumber) => (invoiceNumber >= 1 ? invoiceNumber : null),
            filteredValue: query.invoiceNumber ? [query.invoiceNumber] : null,
        },
        {
            title: "Invoice Date",
            dataIndex: "invoiceDate",
            key: "invoiceDate",
            render: (invoiceDate) =>
                invoiceDate
                    ? dayjsUTC(invoiceDate).format("DD/MM/YYYY")
                    : null,
            ...getDateRangeMenu(setQuery),
            filteredValue:
                query.start && query.end
                    ? [query.start, query.end]
                    : null,
        },
        {
            title: "Invoice Total",
            dataIndex: "invoiceTotal",
            key: "invoiceTotal",
            render: (invoiceTotal, invoice) =>
                invoice.invoiceNumber >= 1 ? <Text>&#x20B9;{invoiceTotal}</Text> : null,
        },
        {
            title: "Vehicle No.",
            dataIndex: "vehicleNumber",
            key: "vehicleNumber",
            ...getSearchMenu("vehicleNumber", searchInputRef, setQuery),
            filteredValue: query.vehicleNumber ? [query.vehicleNumber] : null,
            render: (vehicleNumber, invoice) =>
                invoice.invoiceNumber >= 1 ? <Text>{vehicleNumber}</Text> : null,
        },
        {
            title: "Vehicle Desc",
            dataIndex: "vehicleDesc",
            key: "vehicleDesc",
            ...getSearchMenu("vehicleDesc", searchInputRef, setQuery),
            filteredValue: query.vehicleDesc ? [query.vehicleDesc] : null,
            render: (vehicleDesc, invoice) =>
                invoice.invoiceNumber >= 1 ? <Text>{vehicleDesc}</Text> : null,
        },
        {
            title: "Action",
            key: "action",
            render: (text, invoice) =>
                invoice.invoiceNumber >= 1 ? (
                    <Button
                        shape="round"
                        size="small"
                        type="link"
                        onClick={() => showConfirm(invoice.invoiceNumber)}
                        icon={<DeleteFilled />}
                    ></Button>
                ) : (
                    <Button
                        shape="round"
                        size="small"
                        type="link"
                        icon={<DeleteFilled />}
                        disabled
                    ></Button>
                ),
        },
    ];

    return (
        <Content>
            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={3} strong>
                    Services
                </Title>
                <Button
                    type="primary"
                    onClick={() => handleExport("regular")}
                    size="small"
                    style={{ width: 100 }}
                    icon={<DownloadOutlined />}
                >
                    Export
                </Button>
            </Space>

            <Table
                loading={isLoadingServiceInvoices}
                columns={columns}
                dataSource={serviceInvoices?.data}
                rowKey={(invoice) => invoice.invoiceNumber}
                pagination={{
                    simple: true,
                    current: serviceInvoices?.pagination?.page,
                    pageSize: query.page_size,
                    total: serviceInvoices?.pagination?.total,
                }}
                expandable={{
                    rowExpandable: record => record.invoiceNumber >= 1,
                    expandedRowRender: (record) => (
                        <div >
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {record.serviceItems.map((item) =>
                                        <tr key={item.name}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>&#x20B9;{item.price}</td>
                                            <td>&#x20B9;{Math.round(item.price * item.quantity)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ),
                }}
                onChange={handlePageChange}
            />
        </Content>
    );
}

export default PurchaseTable;
