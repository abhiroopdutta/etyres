import React, { useState, useRef } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Layout,
    Typography,
    message,
    Modal
} from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import {
    SearchOutlined,
    DownloadOutlined,
    DeleteFilled,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

function PurchaseTable({ exportToExcel }) {
    const [query, setQuery] = useState({
        invoiceNumber: "",
        invoiceDateFrom: "",
        invoiceDateTo: "",
        vehicleNumber: "",
        vehicleDesc: "",
        page: 1,
        page_size: 5,
    })
    const searchInputRef = useRef();

    const { isLoading: isLoadingServiceInvoices, data: serviceInvoices } = useQuery({
        queryKey: ["serviceInvoices", query],
        queryFn: () => {
            let queryParams = new URLSearchParams();
            for (let [key, value] of Object.entries(query)) {
                if (value) {
                    if (["invoiceDateFrom", "invoiceDateTo"].includes(key)) {
                        queryParams.append(key, value.format("YYYY-MM-DD"));
                    }
                    else {
                        queryParams.append(key, value);
                    }
                }
            }

            return axios.get("/api/notax/invoices?" + queryParams.toString());
        },
        select: (result) => {
            let responseData = result.data;
            let transformedData = result.data;
            if (responseData.length !== query.page_size) {
                let dummyRows = [];
                for (let i = 1; i <= query.page_size - responseData.length; i++) {
                    dummyRows.push({ invoiceNumber: i / 10 });
                }
                transformedData = [...responseData, ...dummyRows];
            }
            return { data: transformedData, pagination: JSON.parse(result?.headers["x-pagination"]) };
        },
        placeholderData: () => ({
            data: [], headers: { "x-pagination": JSON.stringify({}) }
        }),
    });
    const queryClient = useQueryClient();
    const { mutate: deleteInvoice, isLoading: isLoadingDeleteInvoice } = useMutation({
        mutationFn: invoiceNumber => {
            return axios.delete(`/api/notax/invoices/${invoiceNumber}`, invoiceNumber);
        },
        onSuccess: (response) => {
            message.success(
                "Invoice deleted!", 3
            );
            queryClient.invalidateQueries({
                queryKey: ["serviceInvoices"],
            });
        }
    });

    const getSearchMenu = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInputRef}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Set Filter
                    </Button>
                </Space>
            </div>
        ),
    });
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        setQuery(oldState => ({
            ...oldState,
            [dataIndex]: selectedKeys[0] ?? "",
            page: 1
        }));
        confirm();
    };
    const getDateRangeMenu = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div>
                <RangePicker
                    value={selectedKeys}
                    onChange={(dates, dateStrings) => setSelectedKeys(dates ? dates : [])}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleDateRange(dataIndex, confirm, selectedKeys)}
                        size="small"
                        style={{ width: 80 }}
                    >
                        Set Filter
                    </Button>
                </Space>
            </div>
        ),
    });

    const handleDateRange = (dataIndex, confirm, selectedKeys) => {
        setQuery(oldState => ({
            ...oldState,
            invoiceDateFrom: selectedKeys[0] ?? "",
            invoiceDateTo: selectedKeys[1] ?? "",
            page: 1
        }));
        confirm();
    };

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
                invoiceDateFrom: query.invoiceDateFrom ? query.invoiceDateFrom.format("YYYY-MM-DD") : "",
                invoiceDateTo: query.invoiceDateTo ? query.invoiceDateTo.format("YYYY-MM-DD") : "",
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
            ...getSearchMenu("invoiceNumber"),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInputRef.current.select(), 100);
                }
            },
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
            ...getDateRangeMenu("invoiceDate"),
            filteredValue:
                query.invoiceDateFrom && query.invoiceDateTo
                    ? [query.invoiceDateFrom, query.invoiceDateTo]
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
            ...getSearchMenu("vehicleNumber"),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInputRef.current.select(), 100);
                }
            },
            filteredValue: query.vehicleNumber ? [query.vehicleNumber] : null,
            render: (vehicleNumber, invoice) =>
                invoice.invoiceNumber >= 1 ? <Text>{vehicleNumber}</Text> : null,
        },
        {
            title: "Vehicle Desc",
            dataIndex: "vehicleDesc",
            key: "vehicleDesc",
            ...getSearchMenu("vehicleDesc"),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInputRef.current.select(), 100);
                }
            },
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
