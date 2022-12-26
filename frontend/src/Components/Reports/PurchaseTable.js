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
  DownloadOutlined,
} from "@ant-design/icons";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal.js";
import { dayjsUTC } from "../dayjsUTCLocal";
import { usePurchaseInvoiceList } from "../../api/purchase";
import { getSearchMenu } from "../TableSearchFilter";
import { getDateRangeMenu } from "../TableDateFilter";
import { getDropDownMenu } from "../TableDropDownFilter.js";
const { Content } = Layout;
const { Title, Text } = Typography;

function PurchaseTable({ exportToExcel }) {
  const [query, setQuery] = useState({
    invoiceNumber: "",
    start: "",
    end: "",
    invoiceStatus: ["due", "paid", "cancelled"],
    supplierName: "",
    supplierGSTIN: "",
    claimInvoice: "",
    page: 1,
    page_size: 5,
  })
  const searchInputRef = useRef();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState({});

  const { isLoading: isLoadingPurchaseInvoices, isFetching: isFetchingPurchaseInvoices, data: purchaseInvoices, } = usePurchaseInvoiceList({
    query: query,
    onSuccess: (result) => {
      setSelectedInvoice(oldState => {
        if (oldState.invoiceNumber) {
          return result.data.find((invoice) => invoice.invoiceNumber === oldState.invoiceNumber);
        }
        return oldState;
      });
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

  function handleShowInvoice(record) {
    setSelectedInvoice(record);
    setShowInvoice(true);
  }

  function hideInvoice() {
    setSelectedInvoice({});
    setShowInvoice(false);
  }

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
      title: "Supplier Name",
      dataIndex: ["supplier", "name"],
      key: ["supplier", "name"],
      ...getSearchMenu("supplierName", searchInputRef, setQuery),
      filteredValue: query.supplierName ? [query.supplierName] : null,
      render: (supplierName, invoice) =>
        invoice.invoiceNumber >= 1 ? <Text>{supplierName}</Text> : null,
    },
    {
      title: "Supplier GSTIN",
      dataIndex: ["supplier", "GSTIN"],
      key: ["supplier", "GSTIN"],
      ...getSearchMenu("supplierGSTIN", searchInputRef, setQuery),
      filteredValue: query.supplierGSTIN ? [query.supplierGSTIN] : null,
      render: (supplierGSTIN, invoice) =>
        invoice.invoiceNumber >= 1 ? <Text>{supplierGSTIN}</Text> : null,
    },
    {
      title: "Invoice Status",
      dataIndex: "invoiceStatus",
      key: "invoiceStatus",
      render: (invoiceStatus, invoice) => {
        if (invoice.invoiceNumber >= 1) {
          if (invoiceStatus === "paid")
            return <Tag color="green">Paid</Tag>;
          else if (invoiceStatus === "due")
            return <Tag color="orange">Due</Tag>;
          else
            return <Tag color="red">Cancelled</Tag>;
        }
        else {
          return null;
        }
      },
      ...getDropDownMenu({
        dataIndex: "invoiceStatus",
        multiple: true,
        defaultValue: ["due", "paid", "cancelled"],
        options: [
          { value: "paid", label: "Paid" },
          { value: "due", label: "Due" },
          { value: "cancelled", label: "Cancelled" },
        ],
        setQuery: setQuery,
      }),
      filteredValue: query.invoiceStatus ? [query.invoiceStatus] : null,
    },
    {
      title: "Invoice Type",
      dataIndex: "claimInvoice",
      key: "claimInvoice",
      render: (claimInvoice, invoice) => {
        if (invoice.invoiceNumber >= 1) {
          return claimInvoice ? (
            <Tag color="orange">Claim</Tag>
          ) : (
            <Tag color="green">Regular</Tag>
          );
        } else {
          return null;
        }
      },

      ...getDropDownMenu({
        dataIndex: "claimInvoice",
        defaultValue: "",
        options: [
          { value: "true", label: "Claim" },
          { value: "false", label: "Regular" },
          { value: "", label: "All" },
        ],
        setQuery: setQuery,
      }),
      filteredValue: query.claimInvoice ? [query.claimInvoice] : null,
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
            icon={<EditFilled />}
            onClick={() => {
              handleShowInvoice(invoice);
            }}
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
          Purchase
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
        loading={isLoadingPurchaseInvoices || isFetchingPurchaseInvoices}
        columns={columns}
        dataSource={purchaseInvoices?.data}
        rowKey={(invoice) => invoice.invoiceNumber}
        pagination={{
          simple: true,
          current: purchaseInvoices?.pagination?.page,
          pageSize: query.page_size,
          total: purchaseInvoices?.pagination?.total,
        }}
        onChange={handlePageChange}
      />
      <PurchaseInvoiceModal
        invoice={selectedInvoice}
        visible={showInvoice}
        hideInvoice={hideInvoice}
      />
    </Content>
  );
}

export default PurchaseTable;
