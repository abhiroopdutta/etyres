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
import PurchaseInvoiceModal from "./PurchaseInvoiceModal.js";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Content } = Layout;
const { Title, Text } = Typography;

function PurchaseTable({ exportToExcel }) {
  const [query, setQuery] = useState({
    invoiceNumber: "",
    invoiceDateFrom: "",
    invoiceDateTo: "",
    claimInvoice: "",
    pageRequest: 1,
    maxItemsPerPage: 5,
  })
  const [currentPage, setCurrentPage] = useState({});
  const searchInputRef = useRef();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState({});

  const { isLoading: isLoadingFetchPurchaseInvoices, data: purchaseInvoices, } = useQuery({
    queryKey: ["purchase", query],
    queryFn: () => axios.get("/api/purchase-invoices?" + new URLSearchParams({
      ...query,
      invoiceDateFrom: query.invoiceDateFrom ? query.invoiceDateFrom.format("YYYY-MM-DD") : "",
      invoiceDateTo: query.invoiceDateTo ? query.invoiceDateTo.format("YYYY-MM-DD") : "",
    }).toString()),
    select: (result) => {
      let invoices = result.data.invoices;
      if (invoices.length !== query.maxItemsPerPage) {
        let dummyRows = [];
        for (let i = 1; i <= query.maxItemsPerPage - invoices.length; i++) {
          dummyRows.push({ invoiceNumber: i / 10 });
        }
        return {
          invoices: [...invoices, ...dummyRows],
          pagination: result.data.pagination,
        };
      }
      return {
        invoices: result.data.invoices,
        pagination: result.data.pagination,
      };
    },
    onSuccess: (result) => {
      setCurrentPage(result.pagination);
    },
    placeholderData: () => {
      let dummyRows = [];
      for (let i = 1; i <= query.maxItemsPerPage; i++) {
        dummyRows.push({ invoiceNumber: i / 10 });
      }
      return {
        data: {
          invoices: dummyRows,
          pagination: {},
        }
      };
    },
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
      pageRequest: 1
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
      pageRequest: 1
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
      pageRequest: 1
    }));
    confirm();
  };

  const handlePageChange = (pagination) => {
    let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
    if (itemsAlreadyRequested <= pagination.total)
      setQuery(oldState => ({ ...oldState, pageRequest: pagination.current }));
  };

  const handleExport = (exportType) => {
    exportToExcel({
      ...query,
      invoiceDateFrom: query.invoiceDateFrom ? query.invoiceDateFrom.format("YYYY-MM-DD") : "",
      invoiceDateTo: query.invoiceDateTo ? query.invoiceDateTo.format("YYYY-MM-DD") : "",
      exportRequired: true,
      exportType: "regular",
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
          ? dayjsUTC(invoiceDate["$date"]).format("DD/MM/YYYY")
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
      title: "Supplier Name",
      dataIndex: ["supplierDetails", "name"],
      key: ["supplierDetails", "name"],
      render: (supplierName, invoice) =>
        invoice.invoiceNumber >= 1 ? <Text>{supplierName}</Text> : null,
    },
    {
      title: "Supplier GSTIN",
      dataIndex: ["supplierDetails", "GSTIN"],
      key: ["supplierDetails", "GSTIN"],
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
        loading={isLoadingFetchPurchaseInvoices}
        columns={columns}
        dataSource={purchaseInvoices?.invoices}
        rowKey={(invoice) => invoice.invoiceNumber}
        pagination={{
          simple: true,
          current: currentPage.pageNumber,
          pageSize: query.maxItemsPerPage,
          total: currentPage.totalResults,
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
