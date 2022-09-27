import React, { useMemo } from "react";
import { Modal, Table, Typography, Space, Layout, Divider } from "antd";
import { dayjsUTC } from "../dayjsUTCLocal";
const { Title } = Typography;

function PurchaseInvoiceModal({ invoice, visible, hideInvoice }) {
  const columns = useMemo(
    () => [
      {
        title: "Item Desc",
        dataIndex: "itemDesc",
        key: "itemDesc",
      },
      {
        title: "Item Code",
        dataIndex: "itemCode",
        key: "itemCode",
      },
      {
        title: "HSN",
        dataIndex: "HSN",
        key: "HSN",
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Taxable Value",
        dataIndex: "taxableValue",
        key: "taxableValue",
      },
      {
        title: "Tax",
        dataIndex: "tax",
        key: "tax",
      },
      {
        title: "Item Total",
        dataIndex: "itemTotal",
        key: "itemTotal",
      },
    ],
    []
  );
  const claimColumns = useMemo(
    () => [
      {
        title: "Item Desc",
        dataIndex: "itemDesc",
        key: "itemDesc",
      },
      {
        title: "Item Code",
        dataIndex: "itemCode",
        key: "itemCode",
      },
      {
        title: "Claim Number",
        dataIndex: "claimNumber",
        key: "claimNumber",
      },
    ],
    []
  );

  return (
    <Modal
      visible={visible}
      centered
      destroyOnClose
      onCancel={hideInvoice}
      footer={null}
      width={820}
    >
      <Layout
        style={{
          margin: "15px auto",
        }}
      >
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Title level={4}>Invoice No. {invoice.invoiceNumber}</Title>
          <Title level={5}>
            Invoice Date:
            {invoice.invoiceDate
              ? dayjsUTC(invoice.invoiceDate["$date"]).format("DD/MM/YYYY")
              : null}
          </Title>
        </Space>
        <Divider></Divider>
        {invoice.specialDiscount ? (
          <Title level={5}>
            Special Discount Type: {invoice.specialDiscount}
          </Title>
        ) : null}

        <Table
          columns={invoice.claimInvoice ? claimColumns : columns}
          dataSource={invoice.claimInvoice ? invoice.claimItems : invoice.items}
          rowKey={(item) =>
            invoice.claimInvoice ? item.claimNumber : item.itemCode
          }
          pagination={false}
        />
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Title style={{ padding: "10px 20px 0px 20px" }} level={4}>
            Total &#x20B9;{invoice.invoiceTotal}
          </Title>
        </Space>
      </Layout>
    </Modal>
  );
}

export default PurchaseInvoiceModal;
