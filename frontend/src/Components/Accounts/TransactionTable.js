import React, { useState, useRef } from "react";
import {
    Table,
    Button,
    Space,
    Layout,
    Typography,
    Select,
    Tag,
} from "antd";
import {
    EditFilled,
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useTransactionList } from "../../api/account";
import { getSearchMenu } from "../TableSearchFilter";
import { getDateRangeMenu } from "../TableDateFilter";
const { Option } = Select;
const { Content } = Layout;
const { Title, Text } = Typography;

function TransactionTable({ headers, selectedHeader }) {
    const [query, setQuery] = useState({
        transactionId: "",
        start: "",
        end: "",
        paymentMode: ["cash", "card", "UPI", "bankTransfer", "creditNote"],
        status: ["due", "paid"],
        page: 1,
        page_size: 5,
    });
    const searchInputRef = useRef();
    const { isLoading: isLoadingTransactions, isFetching: isFetchingTransactions, data: transactions, } = useTransactionList({
        query: {
            ...query,
            header: selectedHeader?.code ?? "00"
        }
    });

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
        setQuery((prevFilters) => ({
            ...prevFilters,
            [dataIndex]: value,
            page: 1,
        }));
        confirm();
    };

    const handlePageChange = (pagination) => {
        let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
        if (itemsAlreadyRequested <= pagination.total)
            setQuery((prevState) => ({ ...prevState, page: pagination.current }));
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "transactionId",
            key: "transactionId",
            ...getSearchMenu("transactionId", searchInputRef, setQuery),
            render: (transactionId) => (transactionId?.includes("_") ? transactionId : null),
            filteredValue: query.transactionId ? [query.transactionId] : null,
        },
        {
            title: "Entity",
            key: "entity",
            render: (text, transaction) => {

                //return null if its a dummy row
                if (!transaction.transactionId?.includes("_")) {
                    return null;
                }

                let fromCode = transaction.transactionId.slice(0, 2);
                let toCode = transaction.transactionId.slice(3, 5);
                if (selectedHeader?.code === fromCode) {
                    return headers?.find((header) => header.code === toCode)?.name;
                }
                else {
                    return headers?.find((header) => header.code === fromCode)?.name;
                }

            }
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) =>
                date
                    ? dayjsUTC(date).format("DD/MM/YYYY")
                    : null,
            ...getDateRangeMenu(setQuery),
            filteredValue:
                query.start && query.end
                    ? [query.start, query.end]
                    : null,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount, transaction) => {

                //return null if its a dummy row
                if (!transaction.transactionId?.includes("_")) {
                    return null;
                }

                let fromCode = transaction.transactionId.slice(0, 2);
                let toCode = transaction.transactionId.slice(2, 4);
                if (selectedHeader?.code === fromCode) {
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
                if (transaction.transactionId?.includes("_")) {
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
                    },
                    {
                        value: "creditNote",
                        text: "Credit Note"
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

    return (
        <Content>
            <Space style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={3} strong>
                    {selectedHeader?.name}
                </Title>
                <Title level={3} strong>
                    Balance: &#x20B9;{transactions?.balance}
                </Title>
            </Space>

            <Table
                loading={isLoadingTransactions || isFetchingTransactions}
                columns={columns}
                dataSource={transactions?.data}
                rowKey={(transaction) => transaction?.transactionId}
                pagination={{
                    simple: true,
                    current: transactions?.pagination?.page,
                    pageSize: query.page_size,
                    total: transactions?.pagination?.total,
                }}
                onChange={handlePageChange}
            />
        </Content>
    );
}

export default TransactionTable;
