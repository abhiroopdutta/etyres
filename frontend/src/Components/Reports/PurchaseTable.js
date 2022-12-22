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
import { DatePicker } from "../Antdesign_dayjs_components";
import {
  EditFilled,
  DownloadOutlined,
} from "@ant-design/icons";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal.js";
import { dayjsUTC } from "../dayjsUTCLocal";
import { usePurchaseInvoiceList } from "../../api/purchase";
import { getSearchMenu } from "../TableSearchFilter";
const { RangePicker } = DatePicker;
const { Option } = Select;
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
      start: selectedKeys[0] ?? "",
      end: selectedKeys[1] ?? "",
      page: 1
    }));
    confirm();
  };

  const getDropDownMenu = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Select
          defaultValue=""
          style={{ width: 120 }}
          onChange={(value) =>
            handleDropDownMenuChange(dataIndex, confirm, value)
          }
        >
          <Option value="true">Claim</Option>
          <Option value="false">Regular</Option>
          <Option value="">All</Option>
        </Select>
      </div>
    ),
    filtered: true,
  });

  const handleDropDownMenuChange = (dataIndex, confirm, value) => {
    setQuery(oldState => ({
      ...oldState,
      [dataIndex]: value,
      page: 1
    }));
    confirm();
  };

  const getDropDownMenuInvoiceStatus = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Select
          mode="multiple"
          defaultValue={["due", "paid", "cancelled"]}
          style={{ width: 120 }}
          onChange={(value) =>
            setQuery((oldState) => ({
              ...oldState,
              [dataIndex]: value,
              page: 1,
            }))
          }
          onBlur={confirm}
        >
          <Option value="paid">Paid</Option>
          <Option value="due">Due</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </div>
    ),
    filtered: true,
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
      ...getDateRangeMenu("invoiceDate"),
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
      dataIndex: ["supplierDetails", "name"],
      key: ["supplierDetails", "name"],
      ...getSearchMenu("supplierName", searchInputRef, setQuery),
      filteredValue: query.supplierName ? [query.supplierName] : null,
      render: (supplierName, invoice) =>
        invoice.invoiceNumber >= 1 ? <Text>{supplierName}</Text> : null,
    },
    {
      title: "Supplier GSTIN",
      dataIndex: ["supplierDetails", "GSTIN"],
      key: ["supplierDetails", "GSTIN"],
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
      ...getDropDownMenuInvoiceStatus("invoiceStatus"),
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

      ...getDropDownMenu("claimInvoice"),
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
