import React, { useMemo, useState, useEffect } from "react";
import { Modal, Table, Typography, Space, Layout, Divider, Button, Input, Form } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined
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
    onSuccess: (response, postBody) => {
      if (postBody.invoiceStatus === "cancelled") {
        queryClient.invalidateQueries({
          queryKey: ['products'],
          exact: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['purchase'],
      });
      Modal.success({
        centered: true,
        content: response.data,
      });
    }
  });
  const [taxTable, setTaxTable] = useState(null);
  const { mutate: fetchInvoiceTable } = useMutation({
    mutationFn: postBody => {
      return axios.post('/api/get_gst_tables', postBody);
    },
    onSuccess: (response) =>
      setTaxTable(response.data.GST_table)
  });
  const [payment, setPayment] = useState({ creditNote: 0.0, cash: 0.0, bank: 0.0 });
  let totalPaid = payment.creditNote + payment.bank + payment.cash;
  let due;
  let invoiceStatus = () => {
    if (invoice.invoiceStatus === "cancelled") {
      return "cancelled";
    }
    due = invoice.invoiceTotal - totalPaid;
    if (due === 0) {
      return "paid";
    } else if (due > 0) {
      return "due";
    }
  };
  useEffect(() => {
    if (invoice?.items?.length > 0) {
      fetchInvoiceTable({
        products: invoice.items,
        services: [],
      });
    }
    if (invoice.payment) {
      setPayment(invoice.payment);
    }
    else {
      setPayment({ creditNote: 0.0, cash: 0.0, bank: 0.0 });
    }
  }, [invoice]);

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
        title: "Rate per Item",
        dataIndex: "ratePerItem",
        key: "ratePerItem",
      },
      {
        title: "Taxable Value",
        dataIndex: "taxableValue",
        key: "taxableValue",
      },
      {
        title: "CGST",
        dataIndex: "CGST",
        key: "CGST",
        render: (CGST, item) =>
          `${item.CGSTAmount} (${Math.round(CGST * 100)}%)`,
      },
      {
        title: "SGST",
        dataIndex: "SGST",
        key: "SGST",
        render: (SGST, item) =>
          `${item.SGSTAmount} (${Math.round(SGST * 100)}%)`,
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
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
        updateInvoiceStatus({
          invoiceNumber: invoice.invoiceNumber,
          invoiceStatus: "cancelled",
        });
      },

      onCancel() {
        console.log("Invoice Cancellation aborted");
      },
    });
  };

  const handleSetPayment = (e) => {
    setPayment((prevState) => ({ ...prevState, [e.target.name]: Number(e.target.value) }));
  };

  const handleUpdatePayment = () => {
    if (due < 0) {
      Modal.error({
        content: "Error! Customer has paid more than total payable !",
      });
      return;
    }
    updateInvoiceStatus({
      invoiceNumber: invoice.invoiceNumber,
      invoiceStatus: invoiceStatus(),
      payment: payment,
    });
  };

  return (
    <Modal
      visible={visible}
      centered
      destroyOnClose
      onCancel={hideInvoice}
      footer={null}
      width={900}
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
              Invoice Status: {invoiceStatus()}
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
          dataSource={invoice.claimInvoice ? invoice.claimItems : taxTable?.products}
          rowKey={(item) =>
            invoice.claimInvoice ? item.claimNumber : item.itemCode
          }
          pagination={false}
        />
        <Space style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "15px 0px 0px 0px" }}>
          <Button
            icon={<DeleteOutlined />}
            onClick={showConfirm}
            disabled={invoice.invoiceStatus === "cancelled"}
            loading={isLoadingUpdateInvoiceStatus}
          >
            Cancel invoice
          </Button>
          <Layout >
            <Form
              name="payment-purchase"
              labelCol={{ span: 14 }}
              wrapperCol={{ span: 10 }}
              size="small"
              id="payment-purchase-form"
              style={{ padding: "0", margin: "0" }}
            >
              <Form.Item
                label="Total"
                style={{ padding: "0", margin: "10px 0", fontWeight: "700" }}
              >
                <span>&#x20B9;{invoice.invoiceTotal}</span>
              </Form.Item>

              <Form.Item
                label="Credit Note"
                style={{ padding: "0", margin: "10px 0" }}
              >
                <Input
                  type="number"
                  name="creditNote"
                  onChange={handleSetPayment}
                  value={payment.creditNote}
                />
              </Form.Item>
              <Form.Item
                label="Bank"
                style={{ padding: "0", margin: "10px 0" }}
              >
                <Input
                  type="number"
                  name="bank"
                  onChange={handleSetPayment}
                  value={payment.bank}
                />
              </Form.Item>
              <Form.Item
                label="Cash"
                style={{ padding: "0", margin: "10px 0" }}
              >
                <Input
                  type="number"
                  name="cash"
                  onChange={handleSetPayment}
                  value={payment.cash}
                />
              </Form.Item>
              <Form.Item
                label="Total Paid"
                style={{ padding: "0", margin: "10px 0", fontWeight: "700" }}
              >
                <span>&#x20B9;{totalPaid}</span>
              </Form.Item>
            </Form>
            <Button
              icon={<CreditCardOutlined />}
              onClick={handleUpdatePayment}
              disabled={["paid", "cancelled"].includes(invoice.invoiceStatus)}
              loading={isLoadingUpdateInvoiceStatus}
            >
              Update payment
            </Button>
          </Layout>
        </Space>
      </Layout>
    </Modal>
  );
}

export default PurchaseInvoiceModal;
