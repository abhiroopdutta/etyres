import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Layout,
  Typography,
  Modal,
  Tag,
  Select,
} from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import {
  SearchOutlined,
  EditFilled,
  DownloadOutlined,
} from "@ant-design/icons";
import Invoice from "../CreateOrder/Invoice";
import { dayjsUTC } from "../dayjsUTCLocal";
const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function SalesTable({ exportToExcel }) {
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    invoiceDate: { start: "", end: "" },
    invoiceTotal: "",
    invoiceStatus: ["due", "paid", "cancelled"],
    customerName: "",
    customerContact: "",
    customerVehicleNumber: "",
    customerGSTIN: "",
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
  const [invoiceUpdateSignal, setInvoiceUpdateSignal] = useState({
    invoiceNumber: 0,
    updateCount: 0,
  });
  useEffect(() => {
    if (showInvoice) {
      document.body.style["overflow-y"] = "hidden";
    } else {
      document.body.style["overflow-y"] = "scroll";
    }
  }, [showInvoice]);

  useEffect(() => {
    let didCancel = false; // avoid fetch race conditions or set state on unmounted components
    async function fetchTableData() {
      setLoading(true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "sale",
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
  }, [filters, sorters, pageRequest, maxItemsPerPage, invoiceUpdateSignal]);

  useEffect(() => {
    if (invoiceUpdateSignal.invoiceNumber === 0) {
      return;
    }
    setSelectedInvoice(
      salesInvoices.find(
        (invoice) => invoice.invoiceNumber === invoiceUpdateSignal.invoiceNumber
      )
    );
  }, [salesInvoices, invoiceUpdateSignal]);

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

  const getDropDownMenu = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }}>
        <Select
          mode="multiple"
          defaultValue={["due", "paid", "cancelled"]}
          style={{ width: 120 }}
          onChange={(value) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              [dataIndex]: value,
            }))
          }
          onBlur={() => handleDropDownMenuChange(confirm)}
        >
          <Option value="paid">Paid</Option>
          <Option value="due">Due</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </div>
    ),
    filtered: true,
  });

  const handleDropDownMenuChange = (confirm) => {
    setPageRequest(1);
    confirm();
  };
  const handlePageChange = (pagination) => {
    let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
    if (itemsAlreadyRequested <= pagination.total)
      setPageRequest(pagination.current);
  };

  const handleExport = () => {
    exportToExcel({
      reportType: "sale",
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
    setInvoiceUpdateSignal({
      invoiceNumber: 0,
      updateCount: 0,
    });
    setSelectedInvoice({});
    setShowInvoice(false);
  }

  const getUpdatedInvoice = (invoiceNumber) => {
    setInvoiceUpdateSignal((prevState) => ({
      invoiceNumber: invoiceNumber,
      updateCount: prevState.updateCount + 1,
    }));
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
      filteredValue: filters.invoiceNumber ? [filters.invoiceNumber] : null,
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
        filters.invoiceDate.start && filters.invoiceDate.end
          ? [filters.invoiceDate.start, filters.invoiceDate.end]
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
      title: "Customer Name",
      dataIndex: ["customerDetails", "name"],
      key: ["customerDetails", "name"],
      ...getSearchMenu("customerName"),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current.select(), 100);
        }
      },
      filteredValue: filters.customerName ? [filters.customerName] : null,
    },
    {
      title: "Customer Contact",
      dataIndex: ["customerDetails", "contact"],
      key: ["customerDetails", "contact"],
      ...getSearchMenu("customerContact"),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current.select(), 100);
        }
      },
      filteredValue: filters.customerContact ? [filters.customerContact] : null,
    },
    {
      title: "Customer Vehicle No.",
      dataIndex: ["customerDetails", "vehicleNumber"],
      key: ["customerDetails", "vehicleNumber"],
      ...getSearchMenu("customerVehicleNumber"),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current.select(), 100);
        }
      },
      filteredValue: filters.customerVehicleNumber
        ? [filters.customerVehicleNumber]
        : null,
    },
    {
      title: "Customer GSTIN",
      dataIndex: ["customerDetails", "GSTIN"],
      key: ["customerDetails", "GSTIN"],
      ...getSearchMenu("customerGSTIN"),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current.select(), 100);
        }
      },
      filteredValue: filters.customerGSTIN ? [filters.customerGSTIN] : null,
    },
    {
      title: "Invoice Status",
      dataIndex: "invoiceStatus",
      key: "invoiceStatus",
      render: (invoiceStatus, invoice) => {
        if (invoice.invoiceNumber >= 1) {
          if (invoiceStatus === "paid") return <Tag color="green">Paid</Tag>;
          else if (invoiceStatus === "due")
            return <Tag color="orange">Due</Tag>;
          else return <Tag color="red">Cancelled</Tag>;
        } else {
          return null;
        }
      },
      ...getDropDownMenu("invoiceStatus"),
      filteredValue: filters.invoiceStatus ? [filters.invoiceStatus] : null,
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

  if (salesInvoices.length !== maxItemsPerPage) {
    let dummyRows = [];
    for (let i = 1; i <= maxItemsPerPage - salesInvoices.length; i++) {
      dummyRows.push({ invoiceNumber: i / 10 });
    }
    setSalesInvoices((prevInvoices) => [...prevInvoices, ...dummyRows]);
  }
  return (
    <Content>
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={3} strong>
          Sales
        </Title>
        <Button
          type="primary"
          onClick={handleExport}
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
      {showInvoice ? (
        <Invoice
          visible={showInvoice}
          onCancel={hideInvoice}
          updateMode={true}
          products={selectedInvoice.productItems}
          services={selectedInvoice.serviceItems}
          savedInvoiceNumber={selectedInvoice.invoiceNumber}
          savedInvoiceDate={dayjsUTC(
            selectedInvoice.invoiceDate["$date"]
          ).format("YYYY-MM-DD")}
          savedInvoiceStatus={selectedInvoice.invoiceStatus}
          savedCustomerDetails={selectedInvoice.customerDetails}
          savedPayment={selectedInvoice.payment}
          updateInvoiceInParent={getUpdatedInvoice}
        />
      ) : null}
    </Content>
  );
}

export default SalesTable;
