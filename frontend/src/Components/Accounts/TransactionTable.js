import React, { useEffect, useState, useRef } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Layout,
    Typography,
    Select,
    Tag,
    Modal,
} from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import {
    SearchOutlined,
    EditFilled,
    DownloadOutlined,
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Content } = Layout;
const { Title, Text } = Typography;

function TransactionTable({ headers, selectedHeader, transactionAdded }) {
    const [filters, setFilters] = useState({
        header: "",
        transactionId: "",
        date: { start: "", end: "" },
        paymentMode: ["cash", "card", "UPI", "bankTransfer"],
        status: ["due", "paid"],
    });
    const [sorters, setSorters] = useState({});
    const [pageRequest, setPageRequest] = useState(1);
    const [maxItemsPerPage, setMaxItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef();

    useEffect(() => {
        let didCancel = false; // avoid fetch race conditions or set state on unmounted components
        async function fetchTableData() {
            setLoading(true);

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filters: { ...filters, header: selectedHeader },
                    sorters: sorters,
                    pageRequest: pageRequest,
                    maxItemsPerPage: maxItemsPerPage,
                }),
            };
            try {
                const response = await fetch("/api/get_transactions", requestOptions);
                const result = await response.json();
                if (response.ok && !didCancel) {
                    setTransactions(result.data);
                    setCurrentPage(result.pagination);
                    setLoading(false);
                }
            } catch (err) {
                if (!didCancel) {
                    Modal.error({
                        content: err.message,
                    });
                    console.log(err.message);
                }
            }
        }
        fetchTableData();
        return () => {
            didCancel = true;
        };
    }, [filters, sorters, pageRequest, maxItemsPerPage, transactionAdded]);

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
        setFilters((prevFilters) => ({
            ...prevFilters,
            [dataIndex]: selectedKeys[0] ?? "",
        }));
        setPageRequest(1);
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
        setFilters((prevFilters) => ({
            ...prevFilters,
            [dataIndex]: {
                start: selectedKeys[0] ?? "",
                end: selectedKeys[1] ?? "",
            },
        }));
        setPageRequest(1);
        confirm();
    };

    const getDropDownMenu = (dataIndex, optionsList) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
            <div style={{ padding: 8 }}>
                <Select
                    mode="multiple"
                    defaultValue={optionsList.map((option) => option.value)}
                    style={{ width: 120 }}
                    onChange={(value) =>
                        handleDropDownMenuChange(dataIndex, confirm, value)
                    }
                >
                    {optionsList.map((option) => <Option key={option.value} value={option.value}>{option.text}</Option>)}
                </Select>
            </div>
        ),
        filtered: true,
    });

    const handleDropDownMenuChange = (dataIndex, confirm, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [dataIndex]: value,
        }));
        setPageRequest(1);
        confirm();
    };

    const handlePageChange = (pagination) => {
        let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
        if (itemsAlreadyRequested <= pagination.total)
            setPageRequest(pagination.current);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "transactionId",
            key: "transactionId",
            ...getSearchMenu("transactionId"),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => searchInputRef.current.select(), 100);
                }
            },
            render: (transactionId) => (parseInt(transactionId) >= 1 ? transactionId : null),
            filteredValue: filters.transactionId ? [filters.transactionId] : null,
        },
        {
            title: "Entity",
            key: "entity",
            render: (text, transaction) => {

                //return null if its a dummy row
                if (parseInt(transaction.transactionId) < 1) {
                    return null;
                }

                let fromCode = transaction.transactionId.slice(0, 2);
                let toCode = transaction.transactionId.slice(2, 4);
                if (selectedHeader === fromCode) {
                    return headers.find((header) => header.code === toCode)?.name;
                }
                else {
                    return headers.find((header) => header.code === fromCode)?.name;
                }

            }
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) =>
                date
                    ? dayjsUTC(date["$date"]).format("DD/MM/YYYY")
                    : null,
            ...getDateRangeMenu("date"),
            filteredValue:
                filters.date.start && filters.date.end
                    ? [filters.date.start, filters.date.end]
                    : null,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount, transaction) => {

                //return null if its a dummy row
                if (parseInt(transaction.transactionId) < 1) {
                    return null;
                }

                let fromCode = transaction.transactionId.slice(0, 2);
                let toCode = transaction.transactionId.slice(2, 4);
                if (selectedHeader === fromCode) {
                    return <div>
                        <Tag color="red">-</Tag>
                        <Text>&#x20B9;{amount}</Text>
                    </div>;
                }
                else {
                    return <div>
                        <Tag color="green">+</Tag>
                        <Text>&#x20B9;{amount}</Text>
                    </div>;

                }

            }
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status, transaction) => {
                if (parseInt(transaction.transactionId) >= 1) {
                    return status === "due" ? (
                        <Tag color="orange">Due</Tag>
                    ) : (
                        <Tag color="green">Paid</Tag>
                    );
                } else {
                    return null;
                }
            },

            ...getDropDownMenu("status", [{ value: "paid", text: "Paid" }, { value: "due", text: "Due" }]),
        },
        {
            title: "Payment Mode",
            dataIndex: "paymentMode",
            key: "paymentMode",
            ...getDropDownMenu("paymentMode",
                [
                    {
                        value: "cash",
                        text: "Cash"
                    },
                    {
                        value: "card",
                        text: "Card"
                    },
                    {
                        value: "UPI",
                        text: "UPI"
                    },
                    {
                        value: "bankTransfer",
                        text: "Bank Transfer"
                    }
                ]),
        },
        {
            title: "Action",
            key: "action",
            render: (text, transaction) =>
                transaction.transactionId >= 1 ? (
                    <Button
                        shape="round"
                        size="small"
                        type="link"
                        icon={<EditFilled />}
                    ></Button>
                ) : (
                    <Button
                        shape="round"
                        size="small"
                        type="link"
                        icon={<EditFilled />}
                        disabled
                    ></Button>
                ),
        },
    ];

    if (transactions.length !== maxItemsPerPage) {
        let dummyRows = [];
        for (let i = 1; i <= maxItemsPerPage - transactions.length; i++) {
            dummyRows.push({ transactionId: (i / 10).toString() });
        }
        setTransactions((prevTransactions) => [...prevTransactions, ...dummyRows]);
    }

    return (
        <Content>
            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={3} strong>
                    Purchase
                </Title>
                <Button
                    type="primary"
                    // onClick={handleExport}
                    size="small"
                    style={{ width: 100 }}
                    icon={<DownloadOutlined />}
                >
                    Export
                </Button>
            </Space>

            <Table
                loading={loading}
                columns={columns}
                dataSource={transactions}
                rowKey={(transaction) => transaction.transactionId}
                pagination={{
                    simple: true,
                    current: currentPage.pageNumber,
                    pageSize: maxItemsPerPage,
                    total: currentPage.totalResults,
                }}
                onChange={handlePageChange}
            />

        </Content>
    );
}

export default TransactionTable;
