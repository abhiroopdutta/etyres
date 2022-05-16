import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Table, Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function SalesTable() {
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    invoiceDate: "",
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

  const getTableData = useCallback(
    async (filters, sorters, pageRequest, maxItemsPerPage) => {
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
        if (response.ok) {
          result.data.forEach((invoice) => {
            invoice.invoiceDate = dayjs(invoice.invoiceDate["$date"]).format(
              "DD/MM/YYYY"
            );
          });
          setSalesInvoices(result.data);
          setCurrentPage(result.pagination);
          setLoading(false);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      }
    },
    []
  );

  useEffect(() => {
    getTableData(filters, sorters, pageRequest, maxItemsPerPage);
    console.log("fetch");
  }, [filters, sorters, pageRequest, maxItemsPerPage]);

  const getColumnSearchProps = (dataIndex) => ({
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
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInputRef.current.select(), 100);
      }
    },
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setFilters((prevFilters) => ({
      ...prevFilters,
      [dataIndex]: selectedKeys[0] ?? "",
    }));
    setPageRequest(1);
  };

  console.log(filters);

  const handlePageChange = (pagination, filters, sorter) => {
    let itemsAlreadyRequested = (pagination.current - 1) * pagination.pageSize;
    if (itemsAlreadyRequested <= pagination.total)
      setPageRequest(pagination.current);
  };

  const columns = useMemo(
    () => [
      {
        title: "Invoice No.",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        ...getColumnSearchProps("invoiceNumber"),
      },
      {
        title: "Invoice Date",
        dataIndex: "invoiceDate",
        key: "invoiceDate",
      },
      {
        title: "Invoice Total",
        dataIndex: "invoiceTotal",
        key: "invoiceTotal",
      },
      {
        title: "Customer Name",
        dataIndex: ["customerDetails", "name"],
        key: ["customerDetails", "name"],
        ...getColumnSearchProps("customerName"),
      },
    ],
    []
  );
  return (
    <div>
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
    </div>
  );
}

export default SalesTable;
