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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const { RangePicker } = DatePicker;
const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function SalesTable({ exportToExcel }) {
  const [query, setQuery] = useState({
    invoiceNumber: "",
    invoiceDateFrom: "",
    invoiceDateTo: "",
    invoiceStatus: ["due", "paid", "cancelled"],
    customerName: "",
    customerContact: "",
    customerVehicleNumber: "",
    customerGSTIN: "",
    pageRequest: 1,
    maxItemsPerPage: 5,
  });

  const [currentPage, setCurrentPage] = useState({});
  const searchInputRef = useRef();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState({});
  const [invoiceUpdateSignal, setInvoiceUpdateSignal] = useState({
    invoiceNumber: 0,
    updateCount: 0,
  });
  const { isLoading: isLoadingFetchSalesInvoices, data: salesInvoices, } = useQuery({
    queryKey: ["sale", query],
    queryFn: () => {
      let queryParams = new URLSearchParams({
        ...query,
        invoiceDateFrom: query.invoiceDateFrom ? query.invoiceDateFrom.format("YYYY-MM-DD") : "",
        invoiceDateTo: query.invoiceDateTo ? query.invoiceDateTo.format("YYYY-MM-DD") : "",
      });
      queryParams.delete("invoiceStatus");
      query.invoiceStatus.forEach(element => {
        queryParams.append("invoiceStatus", element);
      });
      return axios.get("/api/sale-invoices?" + queryParams.toString());
    },
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
      setSelectedInvoice(oldState => {
        if (oldState.invoiceNumber) {
          return result.invoices.find((invoice) => invoice.invoiceNumber === oldState.invoiceNumber);
        }
        return oldState;
      });
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
  useEffect(() => {
    if (showInvoice) {
      document.body.style["overflow-y"] = "hidden";
    } else {
      document.body.style["overflow-y"] = "scroll";
    }
  }, [showInvoice]);

  // useEffect(() => {
  //   if (invoiceUpdateSignal.invoiceNumber === 0) {
  //     return;
  //   }
  //   setSelectedInvoice(
  //     salesInvoices.find(
  //       (invoice) => invoice.invoiceNumber === invoiceUpdateSignal.invoiceNumber
  //     )
  //   );
  // }, [salesInvoices, invoiceUpdateSignal]);

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
      pageRequest: 1,
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
          mode="multiple"
          defaultValue={["due", "paid", "cancelled"]}
          style={{ width: 120 }}
          onChange={(value) =>
            setQuery((oldState) => ({
              ...oldState,
              [dataIndex]: value,
              pageRequest: 1,
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
        pageRequest: pagination.current,
      }))
  };

  const handleExport = (exportType) => {
    exportToExcel({
      reportType: "sale",
      exportType: exportType,
      query: {
        ...query,
        invoiceDateFrom: query.invoiceDateFrom ? query.invoiceDateFrom.format("YYYY-MM-DD") : "",
        invoiceDateTo: query.invoiceDateTo ? query.invoiceDateTo.format("YYYY-MM-DD") : "",
        pageRequest: 1,
        maxItemsPerPage: 10000,
      },
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
        loading={isLoadingFetchSalesInvoices}
        columns={columns}
        dataSource={salesInvoices?.invoices}
        rowKey={(invoice) => invoice.invoiceNumber}
        pagination={{
          simple: true,
          current: currentPage.pageNumber,
          pageSize: query.maxItemsPerPage,
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
