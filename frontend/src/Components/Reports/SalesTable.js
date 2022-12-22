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
import { useSaleInvoiceList } from "../../api/sale";
const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function SalesTable({ exportToExcel }) {
  const [query, setQuery] = useState({
    invoiceNumber: "",
    start: "",
    end: "",
    invoiceStatus: ["due", "paid", "cancelled"],
    customerName: "",
    customerContact: "",
    customerVehicleNumber: "",
    customerGSTIN: "",
    page: 1,
    page_size: 5,
  });

  const searchInputRef = useRef();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState({});
  const { isLoading: isLoadingSalesInvoices, isFetching: isFetchingSalesInvoices, data: salesInvoices, } = useSaleInvoiceList({
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

  let scrollBarWidth = window.innerWidth - document.body.clientWidth;
  if (showInvoice) {
    document.body.style.overflowY = "hidden";
    document.body.style.width = `calc(100% - ${scrollBarWidth}px)`;
  } else {
    document.body.style.overflowY = "scroll";
    document.body.style.width = `100%`;
  }

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
    setQuery((oldState) => ({
      ...oldState,
      [dataIndex]: selectedKeys[0] ?? "",
      page: 1,
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
      setQuery(oldState => ({
        ...oldState,
        page: pagination.current,
      }))
  };

  const handleExport = (exportType) => {
    exportToExcel({
      reportType: "sale",
      exportType: exportType,
      query: {
        ...query,
        start: query.start ? query.start.format("YYYY-MM-DD") : "",
        end: query.end ? query.end.format("YYYY-MM-DD") : "",
        page: 1,
        page_size: 10000,
      },
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
      title: "Customer Name",
      dataIndex: ["customerDetails", "name"],
      key: ["customerDetails", "name"],
      ...getSearchMenu("customerName"),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInputRef.current.select(), 100);
        }
      },
      filteredValue: query.customerName ? [query.customerName] : null,
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
      filteredValue: query.customerContact ? [query.customerContact] : null,
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
      filteredValue: query.customerVehicleNumber
        ? [query.customerVehicleNumber]
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
      filteredValue: query.customerGSTIN ? [query.customerGSTIN] : null,
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
      filteredValue: query.invoiceStatus ? [query.invoiceStatus] : null,
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
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={3} strong>
          Sales
        </Title>
        <div>
          <Button
            type="primary"
            onClick={() => handleExport("gstr1")}
            size="small"
            style={{ width: 100, marginRight: "10px" }}
            icon={<DownloadOutlined />}
          >
            GSTR1
          </Button>
          <Button
            type="primary"
            onClick={() => handleExport("regular")}
            size="small"
            style={{ width: 100 }}
            icon={<DownloadOutlined />}
          >
            Export
          </Button>
        </div>
      </Space>

      <Table
        loading={isLoadingSalesInvoices || isFetchingSalesInvoices}
        columns={columns}
        dataSource={salesInvoices?.data}
        rowKey={(invoice) => invoice.invoiceNumber}
        pagination={{
          simple: true,
          current: salesInvoices?.pagination?.page,
          pageSize: query.page_size,
          total: salesInvoices?.pagination?.total,
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
            selectedInvoice.invoiceDate
          ).format("YYYY-MM-DD")}
          savedInvoiceStatus={selectedInvoice.invoiceStatus}
          savedCustomerDetails={selectedInvoice.customerDetails}
          savedPayment={selectedInvoice.payment}
        />
      ) : null}
    </Content>
  );
}

export default SalesTable;
