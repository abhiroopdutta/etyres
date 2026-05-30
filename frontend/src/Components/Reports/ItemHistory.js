import React, { useState } from "react";
import { Layout, Typography, Select, Table, Tag, Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useProductList } from "../../api/product";
import { useItemHistory } from "../../api/report";
import { usePurchaseInvoice } from "../../api/purchase";
import { useSaleInvoice } from "../../api/sale";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal";
import Invoice from "../CreateOrder/Invoice";

const { Title, Text } = Typography;
const { Content } = Layout;

function ItemHistory() {
  const [selectedItemCode, setSelectedItemCode] = useState(null);

  const [showPurchaseInvoice, setShowPurchaseInvoice] = useState(false);
  const [selectedPurchaseInvoiceNumber, setSelectedPurchaseInvoiceNumber] = useState(null);

  const [showSaleInvoice, setShowSaleInvoice] = useState(false);
  const [selectedSaleInvoiceNumber, setSelectedSaleInvoiceNumber] = useState(null);

  const { data: products } = useProductList({ onSuccess: () => null });

  const { data: historyData, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useItemHistory({
    itemCode: selectedItemCode,
    enabled: !!selectedItemCode,
  });

  const { data: purchaseInvoiceData } = usePurchaseInvoice({
    invoiceNumber: selectedPurchaseInvoiceNumber,
    enabled: !!selectedPurchaseInvoiceNumber,
  });

  const { data: saleInvoiceData } = useSaleInvoice({
    invoiceNumber: selectedSaleInvoiceNumber,
    enabled: !!selectedSaleInvoiceNumber,
  });

  let scrollBarWidth = window.innerWidth - document.body.clientWidth;
  if (showSaleInvoice) {
    document.body.style.overflowY = "hidden";
    document.body.style.width = `calc(100% - ${scrollBarWidth}px)`;
  } else {
    document.body.style.overflowY = "scroll";
    document.body.style.width = `100%`;
  }

  const handleInvoiceClick = (record) => {
    if (record.type === "purchase") {
      setSelectedPurchaseInvoiceNumber(record.invoiceNumber);
      setShowPurchaseInvoice(true);
    } else {
      setSelectedSaleInvoiceNumber(record.invoiceNumber);
      setShowSaleInvoice(true);
    }
  };

  const hidePurchaseInvoice = () => {
    setShowPurchaseInvoice(false);
    setSelectedPurchaseInvoiceNumber(null);
  };

  const hideSaleInvoice = () => {
    setShowSaleInvoice(false);
    setSelectedSaleInvoiceNumber(null);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (invoiceDate) => dayjsUTC(invoiceDate).format("DD/MM/YYYY"),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type, record) => {
        if (record.claimInvoice) return <Tag color="orange">Claim</Tag>;
        if (type === "purchase") return <Tag color="blue">Purchase</Tag>;
        return <Tag color="green">Sale</Tag>;
      },
    },
    {
      title: "Invoice No.",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (invoiceNumber, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleInvoiceClick(record)}
        >
          {invoiceNumber}
        </Button>
      ),
    },
    {
      title: "Party",
      dataIndex: "partyName",
      key: "partyName",
    },
    {
      title: "Qty In",
      key: "qtyIn",
      render: (_, record) =>
        record.type === "purchase" ? (
          <Text style={{ color: "green" }}>+{record.quantity}</Text>
        ) : null,
    },
    {
      title: "Qty Out",
      key: "qtyOut",
      render: (_, record) =>
        record.type === "sale" ? (
          <Text style={{ color: "red" }}>-{record.quantity}</Text>
        ) : null,
    },
    {
      title: "Rate",
      dataIndex: "ratePerItem",
      key: "ratePerItem",
      render: (rate) => <Text>&#x20B9;{rate?.toFixed(2)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "invoiceStatus",
      key: "invoiceStatus",
      render: (status) => {
        if (status === "paid") return <Tag color="green">Paid</Tag>;
        if (status === "due") return <Tag color="orange">Due</Tag>;
        return <Tag color="red">Cancelled</Tag>;
      },
    },
    {
      title: "Running Stock",
      dataIndex: "runningStock",
      key: "runningStock",
      render: (stock) => <Text strong>{stock}</Text>,
    },
  ];

  return (
    <Content>
      <Title level={3}>Item History</Title>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Select
          showSearch
          placeholder="Search by item code or description"
          options={products}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase()) ||
            option.value.toLowerCase().includes(input.toLowerCase()) ||
            (option.size && option.size.toString().match(input))
          }
          onChange={(value) => setSelectedItemCode(value)}
          style={{ width: 400 }}
          allowClear
          onClear={() => setSelectedItemCode(null)}
        />

        {historyData && (
          <Space size="large">
            <Text strong>{historyData.product.itemDesc}</Text>
            <Text>
              Current Stock: <Text strong>{historyData.product.currentStock}</Text>
            </Text>
          </Space>
        )}

        {selectedItemCode && (
          <Table
            loading={isLoadingHistory || isFetchingHistory}
            columns={columns}
            dataSource={historyData?.history}
            rowKey={(record) => `${record.type}-${record.invoiceNumber}`}
            pagination={false}
            size="small"
            rowClassName={(record) =>
              record.invoiceStatus === "cancelled" ? "cancelled-row" : ""
            }
            locale={{ emptyText: "No purchase or sale records found for this item" }}
          />
        )}
      </Space>

      {showPurchaseInvoice && purchaseInvoiceData && (
        <PurchaseInvoiceModal
          invoice={purchaseInvoiceData}
          visible={showPurchaseInvoice}
          hideInvoice={hidePurchaseInvoice}
        />
      )}

      {showSaleInvoice && saleInvoiceData ? (
        <Invoice
          visible={showSaleInvoice}
          onCancel={hideSaleInvoice}
          updateMode={true}
          products={saleInvoiceData.productItems}
          savedInvoiceNumber={saleInvoiceData.invoiceNumber}
          savedInvoiceDate={dayjsUTC(saleInvoiceData.invoiceDate).format("YYYY-MM-DD")}
          savedInvoiceStatus={saleInvoiceData.invoiceStatus}
          savedCustomerDetails={saleInvoiceData.customerDetails}
          savedPayment={saleInvoiceData.payment}
        />
      ) : null}

      <style>{`
        .cancelled-row td {
          text-decoration: line-through;
          opacity: 0.5;
        }
      `}</style>
    </Content>
  );
}

export default ItemHistory;
