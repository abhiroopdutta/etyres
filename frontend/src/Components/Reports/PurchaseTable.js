import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Layout,
  Typography,
  Select,
  Tag,
} from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import { SearchOutlined, EditFilled } from "@ant-design/icons";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal.js";
import { dayjsLocal, dayjsUTC } from "../dayjsUTCLocal";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Content } = Layout;
const { Title, Text } = Typography;

function SalesTable({ exportToExcel }) {
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    invoiceDate: { start: "", end: "" },
    invoiceTotal: "",
    claimInvoice: "",
  });
  const [sorters, setSorters] = useState({});
  const [pageRequest, setPageRequest] = useState(1);
  const [maxItemsPerPage, setMaxItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState({});
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState({});

  useEffect(() => {
    let didCancel = false; // avoid fetch race conditions or set state on unmounted components
    async function fetchTableData() {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "purchase",
          filters: filters,
          sorters: sorters,
          pageRequest: pageRequest,
          maxItemsPerPage: maxItemsPerPage,
          export: false,
        }),
      };
      try {
        const response = await fetch("/api/reports", requestOptions);
        const result = await response.json();
        if (response.ok && !didCancel) {
          setSalesInvoices(result.data);
          setCurrentPage(result.pagination);
          setLoading(false);
        }
      } catch (err) {
        if (!didCancel) {
          alert(err.message);
          console.log(err.message);
        }
      }
    }
    fetchTableData();
    return () => {
      didCancel = true;
    };
  }, [filters, sorters, pageRequest, maxItemsPerPage]);

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
    confirm();
    setFilters((prevFilters) => ({
      ...prevFilters,
      [dataIndex]: {
        start: dayjsLocal(selectedKeys[0])?.format("YYYY-MM-DD") ?? "",
        end: dayjsLocal(selectedKeys[1])?.format("YYYY-MM-DD") ?? "",
      },
    }));
  };

  const getDropDownMenu = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Select
          defaultValue=""
          style={{ width: 120 }}
          onChange={(value) => {
            setFilters((prevFilters) => ({
              ...prevFilters,
              [dataIndex]: value,
            }));
            confirm();
          }}
        >
          <Option value="true">Claim</Option>
          <Option value="false">Regular</Option>
          <Option value="">All</Option>
        </Select>
      </div>
    ),
    filtered: true,
  });

  const handlePageChange = (pagination) => {
    let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
    if (itemsAlreadyRequested <= pagination.total)
      setPageRequest(pagination.current);
  };

  const handleExport = () => {
    exportToExcel({
      reportType: "purchase",
      filters: filters,
      sorters: sorters,
      pageRequest: 1,
      maxItemsPerPage: 10000,
      export: true,
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

  const columns = useMemo(
    () => [
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
      },
      {
        title: "Invoice Date",
        dataIndex: "invoiceDate",
        key: "invoiceDate",
        render: (invoiceDate) =>
          dayjsUTC(invoiceDate["$date"]).format("DD/MM/YYYY"),
        ...getDateRangeMenu("invoiceDate"),
      },
      {
        title: "Invoice Total",
        dataIndex: "invoiceTotal",
        key: "invoiceTotal",
        render: (invoiceTotal) => <Text>&#x20B9;{invoiceTotal}</Text>,
      },
      {
        title: "Invoice Type",
        dataIndex: "claimInvoice",
        key: "claimInvoice",
        render: (claimInvoice) =>
          claimInvoice ? (
            <Tag color="orange">Claim</Tag>
          ) : (
            <Tag color="green">Regular</Tag>
          ),
        ...getDropDownMenu("claimInvoice"),
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => (
          <Button
            shape="round"
            size="small"
            type="link"
            icon={<EditFilled />}
            onClick={() => {
              handleShowInvoice(record);
            }}
          ></Button>
        ),
      },
    ],
    []
  );
  return (
    <Content>
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={3} strong>
          Purchase
        </Title>
        <Button
          type="primary"
          onClick={handleExport}
          size="small"
          style={{ width: 80 }}
        >
          Export
        </Button>
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={salesInvoices}
        rowKey={(invoice) => invoice.invoiceNumber}
        pagination={{
          simple: true,
          current: currentPage.pageNumber,
          pageSize: maxItemsPerPage,
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

export default SalesTable;
