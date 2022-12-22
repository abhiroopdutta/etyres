import React, { useState, useRef } from "react";
import {
    Table,
    Button,
    Space,
    Layout,
    Typography,
    Tag,
} from "antd";
import {
    EditFilled,
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useTransactionList } from "../../api/account";
import { getSearchMenu } from "../TableSearchFilter";
import { getDateRangeMenu } from "../TableDateFilter";
import { getDropDownMenu } from "../TableDropDownFilter";
const { Content } = Layout;
const { Title, Text } = Typography;

function TransactionTable({ headers, selectedHeader }) {
    const paymentModeOptions = [
        {
            value: "cash",
            label: "Cash"
        },
        {
            value: "card",
            label: "Card"
        },
        {
            value: "UPI",
            label: "UPI"
        },
        {
            value: "bankTransfer",
            label: "Bank Transfer"
        },
        {
            value: "creditNote",
            label: "Credit Note"
        }
    ];
    const [query, setQuery] = useState({
        transactionId: "",
        start: "",
        end: "",
        paymentMode: paymentModeOptions.map(option => option.value),
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
            title: "Payment Mode",
            dataIndex: "paymentMode",
            key: "paymentMode",
            ...getDropDownMenu({
                dataIndex: "paymentMode",
                multiple: true,
                defaultValue: paymentModeOptions.map(option => option.value),
                options: paymentModeOptions,
                setQuery: setQuery,
            }),
            filteredValue: query.paymentMode ? [query.paymentMode] : null,
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
