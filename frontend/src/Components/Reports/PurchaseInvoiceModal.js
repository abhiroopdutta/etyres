import React, { useMemo } from "react";
import { Modal, Table, Typography, Space, Layout, Divider, Button } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const { confirm } = Modal;

const { Title } = Typography;

function PurchaseInvoiceModal({ invoice, visible, hideInvoice }) {
  const queryClient = useQueryClient();
  const { isLoadingUpdateInvoiceStatus, mutate: updateInvoiceStatus } = useMutation({
    mutationFn: postBody => {
      return axios.post('/api/update_purchase_invoice_status', postBody)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
        exact: true,
      })
    }
  })
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
  const showConfirm = () => {
    confirm({
      centered: true,
      title: "Are you sure you want to cancel this invoice?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This will reverse the product stock, please make sure to tally with physical stock",

      onOk() {
        handleCancelInvoice("cancelled");
      },

      onCancel() {
        console.log("Invoice Cancellation aborted");
      },
    });
  };
  const handleCancelInvoice = () => {
    updateInvoiceStatus({
      invoiceNumber: invoice.invoiceNumber,
      invoiceStatus: "cancelled",
    });
  };

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
        <Space style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Title level={4} >Invoice No. {invoice.invoiceNumber} </Title>
            <Title level={5} style={{ margin: "0" }}>
              Invoice Status: {invoice.invoiceStatus}
            </Title>
            <Title level={5} style={{ margin: "0" }}>
              Supplier: {invoice.supplierDetails?.name}
            </Title>
            <Title level={5} style={{ margin: "0" }}>
              GSTIN: {invoice.supplierDetails?.GSTIN}
            </Title>
          </div >
          <Title level={5} style={{ margin: "0" }}>
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
        <Space style={{ display: "flex", justifyContent: "space-between", padding: "15px 0px 0px 0px" }}>
          <Button
            icon={<DeleteOutlined />}
            onClick={showConfirm}
            disabled={invoice.invoiceStatus === "cancelled"}
            loading={isLoadingUpdateInvoiceStatus}
          >
            Cancel invoice
          </Button>
          <Title level={4}>
            Total &#x20B9;{invoice.invoiceTotal}
          </Title>
        </Space>
      </Layout>
    </Modal>
  );
}

export default PurchaseInvoiceModal;
