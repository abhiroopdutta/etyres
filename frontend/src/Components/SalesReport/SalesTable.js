import React, { useEffect, useState, useMemo, useRef } from "react";
import { Table, Input, Button, Space, Layout, Typography } from "antd";
import { DatePicker } from "../Antdesign_dayjs_components";
import { SearchOutlined, EditFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import Invoice from "../CreateOrder/Invoice";
const { RangePicker } = DatePicker;
const { Header, Footer, Sider, Content } = Layout;
const { Title, Paragraph, Text, Link } = Typography;

function SalesTable({ exportToExcel }) {
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    invoiceDate: { start: "", end: "" },
    invoiceTotal: "",
    customerName: "",
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
          filters: filters,
          sorters: sorters,
          pageRequest: pageRequest,
          maxItemsPerPage: maxItemsPerPage,
        }),
      };
      try {
        const response = await fetch("/api/sales_invoices", requestOptions);
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
    console.log("fetch");
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
        start: selectedKeys[0]?.format("YYYY-MM-DD") ?? "",
        end: selectedKeys[1]?.format("YYYY-MM-DD") ?? "",
      },
    }));
  };

  const handlePageChange = (pagination) => {
    let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
    if (itemsAlreadyRequested <= pagination.total)
      setPageRequest(pagination.current);
  };

  const handleExport = () => {
    exportToExcel("sale", filters);
  };

  function handleShowInvoice(record) {
    console.log(record);
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
          dayjs(invoiceDate["$date"]).format("DD/MM/YYYY"),
        ...getDateRangeMenu("invoiceDate"),
      },
      {
        title: "Invoice Total",
        dataIndex: "invoiceTotal",
        key: "invoiceTotal",
        render: (invoiceTotal) => <Text>&#x20B9;{invoiceTotal}</Text>,
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
    <Layout
      style={{
        background: "rgba(256, 256, 256)",
        maxWidth: "90%",
        margin: "0 auto",
      }}
    >
      <Header style={{ background: "rgba(256, 256, 256)" }}>
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={3} strong>
            Sales Table
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
      </Header>
      <Content>
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
            defaultOrderConfirmed={true}
            products={selectedInvoice.productItems}
            services={selectedInvoice.serviceItems}
            defaultInvoiceNumber={selectedInvoice.invoiceNumber}
            defaultInvoiceDate={dayjs(
              selectedInvoice.invoiceDate["$date"]
            ).format("YYYY-MM-DD")}
            defaultCustomerDetails={selectedInvoice.customerDetails}
            hideInvoice={hideInvoice}
          />
        ) : null}
      </Content>
    </Layout>
  );
}

export default SalesTable;
