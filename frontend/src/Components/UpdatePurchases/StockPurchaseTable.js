import React, { useMemo, useState, useReducer } from "react";
import { Modal, Table, message, Space, Button, Form, Input, Select, AutoComplete } from "antd";
import {
    DeleteOutlined,
} from "@ant-design/icons";
import { roundToTwo } from "../../utils";


function StockPurchaseTable({ items, dispatchItems, options, filterOptions, setFilterOptions }) {
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
                options={filterOptions}
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

    const handleSearch = (newValue, key) => {
        if (newValue) {
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

    return (
        <>
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
        </>
    );

}

export default StockPurchaseTable;