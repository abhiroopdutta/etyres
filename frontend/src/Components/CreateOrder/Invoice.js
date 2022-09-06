import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { dayjsLocal } from "../dayjsUTCLocal";
import "./Invoice.css";
import { Modal, Button, Checkbox } from "antd";
import {
  PrinterFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
const { confirm } = Modal;

function getTodaysDate() {
  return dayjsLocal(new Date()).format("YYYY-MM-DD");
}

// -----------------------Invoice(creating, reading)--------------------------
// This component can be used both while creating, and reading an invoice.
// Optional parameters must not be used while creating an invoice.
// When updating an invoice, updateMode must be set to true
// and all other optional parameters must be initailized explicitly
// otherwise the component may fail.
// ---------------------------------------------------------------------------

function Invoice({
  visible,
  onCancel,
  updateMode,
  products,
  services,
  savedInvoiceNumber,
  savedInvoiceDate,
  savedInvoiceStatus,
  savedCustomerDetails,
  savedPayment,
  updateInvoiceInParent,
}) {
  const [showHideClassName, setShowHideClassName] = useState();
  const [invoiceNumber, setInvoiceNumber] = useState();
  const [invoiceDate, setInvoiceDate] = useState(getTodaysDate());
  const [invoiceStatus, setInvoiceStatus] = useState("due");
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    GSTIN: "",
    stateCode: "",
    state: "",
    vehicleNumber: "",
    contact: "",
  });
  const [payment, setPayment] = useState({ cash: 0, card: 0, UPI: 0 });
  const [GSTTable, setGSTTable] = useState();
  const [IGSTTable, setIGSTTable] = useState();
  const [loading, setLoading] = useState(false);
  //render different tables depending on IGST customer or not
  const [IGSTRender, setIGSTRender] = useState(false);
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    setShowHideClassName(
      visible ? "invoice display-block" : "invoice display-none"
    );
  }, [visible]);

  //Get invoice number from backend
  useEffect(() => {
    async function getNewInvoiceNumber() {
      fetch("/api/sales_invoice_number")
        .then((res) => res.json())
        .then((number) => setInvoiceNumber(number));
    }

    // Get the invoice number if in create mode otherwise get saved invoice details
    if (updateMode) {
      setInvoiceNumber(savedInvoiceNumber);
      setInvoiceDate(savedInvoiceDate);
      setInvoiceStatus(savedInvoiceStatus);
      setCustomerDetails(savedCustomerDetails);
      setPayment(savedPayment);
      if (
        savedCustomerDetails.GSTIN === "0" ||
        savedCustomerDetails.GSTIN.startsWith("09") ||
        !savedCustomerDetails.GSTIN
      ) {
        setIGSTRender(false);
      } else {
        setIGSTRender(true);
      }
    } else {
      getNewInvoiceNumber();
    }
  }, [
    updateMode,
    savedInvoiceNumber,
    savedInvoiceDate,
    savedInvoiceStatus,
    savedCustomerDetails,
    savedPayment,
  ]);

  useEffect(() => {
    let data = {
      products: products,
      services: services.filter((service) => {
        return service.quantity > 0;
      }),
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    const getTableData = async () => {
      try {
        const response = await fetch("/api/get_gst_tables", requestOptions);
        const result = await response.json();
        if (response.ok) {
          setGSTTable(result.GST_table);
          setIGSTTable(result.IGST_table);
        } else {
          throw Error(result);
        }
      } catch (err) {
        Modal.error({
          content: err.message,
        });
        console.log(err.message);
      }
    };

    getTableData();
  }, [products, services]);

  //update invoice status depending on payment completed or not
  useEffect(() => {
    // status of a paid/cancelled invoice cannot be updated
    if (["paid", "cancelled"].includes(savedInvoiceStatus)) {
      return;
    }
    let total;
    if (IGSTRender) {
      total = IGSTTable?.invoiceTotal;
    } else {
      total = GSTTable?.invoiceTotal;
    }
    let totalPaid = payment.cash + payment.card + payment.UPI;
    let due = total - totalPaid;
    if (due === 0) {
      setInvoiceStatus("paid");
    } else if (due < 0) {
      Modal.error({
        content: "Error! Customer has paid more than total payable !",
      });
    } else if (due > 0) {
      setInvoiceStatus("due");
    }
  }, [payment, IGSTRender, GSTTable, IGSTTable, savedInvoiceStatus]);

  const handleInvoiceClose = () => {
    //if update mode then reset every state to original
    if (updateMode) {
      setInvoiceNumber(0);
      setInvoiceDate(getTodaysDate());
      setInvoiceStatus("due");
      setCustomerDetails({
        name: "",
        address: "",
        GSTIN: "",
        stateCode: "",
        state: "",
        vehicleNumber: "",
        contact: "",
      });
      setPayment({ cash: 0, card: 0, UPI: 0 });
      setGSTTable(null);
      setIGSTTable(null);
      setLoading(false);
      setIGSTRender(false);
    }
    onCancel();
  };

  //if customer GSTIN doesn't start with 09, then IGST
  const handleIGST = (e) => {
    setCustomerDetails((customerDetails) => ({
      ...customerDetails,
      [e.target.name]: e.target.value,
    }));

    if (
      e.target.value === "0" ||
      e.target.value.startsWith("09") ||
      !e.target.value
    ) {
      setIGSTRender(false);
    } else {
      setIGSTRender(true);
    }
  };

  const handleInvoiceDate = (e) => {
    setInvoiceDate(e.target.value);
    console.log(e.target.value);
  };

  const handleCustomerDetails = (e) => {
    setCustomerDetails((customerDetails) => ({
      ...customerDetails,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmOrder = (e) => {
    setLoading(true);
    //prepare full invoice data to send to backend
    let invoiceData = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      invoiceStatus: invoiceStatus,
      customerDetails: customerDetails,
    };
    if (!IGSTRender) {
      invoiceData["invoiceTotal"] = GSTTable["invoiceTotal"];
      invoiceData["products"] = GSTTable["products"];
      invoiceData["services"] = GSTTable["services"];
      invoiceData["invoiceRoundOff"] = GSTTable["invoiceRoundOff"];
    } else {
      invoiceData["invoiceTotal"] = IGSTTable["invoiceTotal"];
      invoiceData["products"] = IGSTTable["products"];
      invoiceData["services"] = IGSTTable["services"];
      invoiceData["invoiceRoundOff"] = IGSTTable["invoiceRoundOff"];
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    };

    const place_order = async () => {
      try {
        const response = await fetch("/api/place_order", requestOptions);
        const result = await response.json();
        if (response.ok) {
          setLoading(false);
          Modal.success({
            content: result,
          });

          //notify parent to update props (update mode and rest of invoice props)
          updateInvoiceInParent(invoiceNumber);
        } else {
          throw Error(result);
        }
      } catch (err) {
        Modal.error({
          content: err.message,
        });
        console.log(err.message);
      }
    };

    place_order();
  };

  const showConfirm = () => {
    confirm({
      title: "Are you sure you want to cancel this invoice?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This will reverse the product stock, please make sure to tally with physical stock",

      onOk() {
        handleUpdateInvoiceStatus("cancelled");
      },

      onCancel() {
        console.log("Invoice Cancellation aborted");
      },
    });
  };
  const handleFocus = (e) => e.target.select();
  const handlePayment = (e) => {
    setPayment((payment) => {
      let inputValue;
      if (e.target.value === "") {
        inputValue = 0;
      } else {
        inputValue = parseFloat(e.target.value);
      }
      return { ...payment, [e.target.id]: inputValue };
    });
  };

  const handleUpdateInvoiceStatus = (status) => {
    //prepare invoice status update to send to backend
    let invoiceStatusData = {
      invoiceNumber: invoiceNumber,
      invoiceStatus: status,
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceStatusData),
    };

    const updateInvoice = async () => {
      try {
        const response = await fetch(
          "/api/update_invoice_status",
          requestOptions
        );
        const result = await response.json();
        if (response.ok) {
          Modal.success({
            content: result,
          });

          //notify parent to update its props (invoice props)
          updateInvoiceInParent(invoiceNumber);
        } else {
          throw Error(result);
        }
      } catch (err) {
        Modal.error({
          content: err.message,
        });
        console.log(err.message);
      }
    };

    updateInvoice();
  };

  return (
    <div className={showHideClassName} onClick={handleInvoiceClose}>
      <div className="left-buttons-container">
        <Button
          size="large"
          disabled={!updateMode}
          onClick={(e) => {
            handlePrintInvoice();
            e.stopPropagation();
          }}
          type="default"
          icon={<PrinterFilled />}
        ></Button>

        <Button
          type="default"
          disabled={!updateMode || savedInvoiceStatus === "cancelled"}
          onClick={(e) => {
            showConfirm();
            e.stopPropagation();
          }}
        >
          Cancel Invoice
        </Button>
      </div>

      <div
        ref={componentRef}
        className="invoice-body"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invoice-header">
          <header className="shop-details">
            <h4>EUREKA TYRES - APOLLO PV ZONE</h4>
            <address>
              GSTIN: 09FWTPD4101B1ZT, State: Uttar Pradesh, Code:09
            </address>
            <address>
              <address>52/42/6A, Tashkand Marg, Civil Lines, Allahabad</address>
            </address>
            <address>Uttar Pradesh - 211001 | Contact: +91 94355 55596</address>
          </header>

          <header className="invoice-details">
            <h4> Tax Invoice # {invoiceNumber}</h4>
            <h4>
              Invoice Date:{" "}
              <input
                type="date"
                value={invoiceDate}
                required="required"
                disabled={updateMode}
                onChange={(e) => handleInvoiceDate(e)}
              />
            </h4>
            <h4> Invoice Status: {invoiceStatus}</h4>
          </header>
        </div>
        <hr />

        <div className="customer-details">
          <label htmlFor="name">Bill To: </label>
          <input
            id="name"
            name="name"
            className="name"
            type="text"
            value={customerDetails.name}
            onChange={handleCustomerDetails}
            disabled={updateMode}
            placeholder={updateMode ? null : "Customer Name"}
          />
          <br />
          <label htmlFor="address">Address: </label>
          <input
            id="address"
            name="address"
            className="address"
            type="text"
            value={customerDetails.address}
            onChange={handleCustomerDetails}
            disabled={updateMode}
            placeholder={updateMode ? null : "Customer Address"}
          />
          <br />
          <label htmlFor="vehicleNumber">Vehicle No. : </label>
          <input
            id="vehicleNumber"
            name="vehicleNumber"
            className="vehicleNumber"
            type="text"
            value={customerDetails.vehicleNumber}
            onChange={handleCustomerDetails}
            disabled={updateMode}
            placeholder={updateMode ? null : "Customer Vehicle No."}
          />
          <br />
          <label htmlFor="contact">Contact: </label>
          <input
            id="contact"
            name="contact"
            className="contact"
            type="text"
            value={customerDetails.contact}
            onChange={handleCustomerDetails}
            disabled={updateMode}
            placeholder={updateMode ? null : "Customer Contact No."}
          />
          <section className="customer-details-gst">
            <label htmlFor="GSTIN">GSTIN: </label>
            <input
              id="GSTIN"
              name="GSTIN"
              className="GSTIN"
              type="text"
              maxLength="15"
              value={customerDetails.GSTIN}
              onChange={handleIGST}
              disabled={updateMode}
              placeholder={updateMode ? null : "Customer GSTIN"}
            />
            <label htmlFor="state">State: </label>
            <input
              id="state"
              name="state"
              className="state"
              type="text"
              value={customerDetails.state}
              onChange={handleCustomerDetails}
              disabled={updateMode}
              placeholder={updateMode ? null : "GST State"}
            />
            <label htmlFor="stateCode">Code: </label>
            <input
              id="stateCode"
              name="stateCode"
              className="stateCode"
              type="text"
              value={customerDetails.stateCode}
              onChange={handleCustomerDetails}
              maxLength="2"
              disabled={updateMode}
              placeholder={updateMode ? null : "GST State Code"}
            />
          </section>
        </div>

        {IGSTRender ? (
          <div className="IGST">
            <table className="IGST-table">
              <thead>
                <tr>
                  <th className="particulars">Particulars</th>
                  <th className="HSNCode">HSN</th>
                  <th className="Qty">Qty</th>
                  <th className="Rate-per-item">Rate per Item</th>
                  <th className="taxable-value">Taxable value</th>
                  <th>IGST</th>
                  <th className="value">Value</th>
                </tr>
              </thead>

              <tbody>
                {IGSTTable?.products.map((tyre, index) => (
                  <tr key={tyre.itemCode}>
                    <td>{tyre.itemDesc}</td>
                    <td>{tyre.HSN}</td>
                    <td>{tyre.quantity}</td>
                    <td>{tyre.ratePerItem}</td>
                    <td>{tyre.taxableValue}</td>
                    <td className="IGST-cell">
                      {String(tyre.IGSTAmount) +
                        " (" +
                        String(Math.round(tyre.IGST * 100)) +
                        "%)"}
                    </td>
                    <td>{tyre.value}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th>Net Amount</th>
                  <td>-</td>
                  <td>{IGSTTable?.total.quantity}</td>
                  <td>-</td>
                  <td>{IGSTTable?.total.taxableValue}</td>
                  <td>{IGSTTable?.total.IGSTAmount}</td>
                  <td>{IGSTTable?.total.value}</td>
                </tr>
              </tfoot>
            </table>
            <br />
            <table className="rounding-table">
              <thead>
                <tr>
                  <td>Round Off</td>
                  <td>{IGSTTable?.invoiceRoundOff}</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>TOTAL</th>
                  <th>&#x20B9;{IGSTTable?.invoiceTotal}</th>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="GST">
            <table className="GST-table">
              <thead>
                <tr>
                  <th className="particulars">Particulars</th>
                  <th className="HSNCode">HSN</th>
                  <th className="Qty">Qty</th>
                  <th className="Rate-per-item">Rate per Item</th>
                  <th className="taxable-value">Taxable value</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th className="value">Value</th>
                </tr>
              </thead>

              <tbody>
                {GSTTable?.products.map((tyre, index) => (
                  <tr key={tyre.itemCode}>
                    <td>{tyre.itemDesc}</td>
                    <td>{tyre.HSN}</td>
                    <td>{tyre.quantity}</td>
                    <td>{tyre.ratePerItem}</td>
                    <td>{tyre.taxableValue}</td>
                    <td>
                      {String(tyre.CGSTAmount) +
                        " (" +
                        String(Math.round(tyre.CGST * 100)) +
                        "%)"}
                    </td>
                    <td>
                      {String(tyre.SGSTAmount) +
                        " (" +
                        String(Math.round(tyre.SGST * 100)) +
                        "%)"}
                    </td>
                    <td>{tyre.value}</td>
                  </tr>
                ))}

                {GSTTable?.services.map((service, index) => (
                  <tr key={service.itemDesc}>
                    <td>{service.itemDesc}</td>
                    <td>{service.HSN}</td>
                    <td>{service.quantity}</td>
                    <td>{service.ratePerItem}</td>
                    <td>{service.taxableValue}</td>
                    <td>
                      {String(service.CGSTAmount) +
                        " (" +
                        String(Math.round(service.CGST * 100)) +
                        "%)"}
                    </td>
                    <td>
                      {String(service.SGSTAmount) +
                        " (" +
                        String(Math.round(service.SGST * 100)) +
                        "%)"}
                    </td>
                    <td>{service.value}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>Net Amount</td>
                  <td>-</td>
                  <td>{GSTTable?.total.quantity}</td>
                  <td>-</td>
                  <td>{GSTTable?.total.taxableValue}</td>
                  <td>{GSTTable?.total.CGSTAmount}</td>
                  <td>{GSTTable?.total.SGSTAmount}</td>
                  <td>{GSTTable?.total.value}</td>
                </tr>
              </tfoot>
            </table>
            <div className="rounding-table-container">
              <table className="rounding-table">
                <thead>
                  <tr>
                    <td>Round off</td>
                    <td>{GSTTable?.invoiceRoundOff}</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th>TOTAL</th>
                    <th>&#x20B9; {GSTTable?.invoiceTotal}</th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="payment-input-list-container">
          <ul className="payment-input-list">
            <div>
              <label htmlFor="cash">Cash</label>
              <input
                type="number"
                id="cash"
                onChange={handlePayment}
                onFocus={handleFocus}
                value={payment.cash}
                disabled={["paid", "cancelled"].includes(savedInvoiceStatus)}
              />
            </div>
            <div>
              <label htmlFor="card">Card</label>
              <input
                type="number"
                id="card"
                onChange={handlePayment}
                onFocus={handleFocus}
                value={payment.card}
                disabled={["paid", "cancelled"].includes(savedInvoiceStatus)}
              />
            </div>
            <div>
              <label htmlFor="UPI">UPI</label>
              <input
                type="number"
                id="UPI"
                onChange={handlePayment}
                onFocus={handleFocus}
                value={payment.UPI}
                disabled={["paid", "cancelled"].includes(savedInvoiceStatus)}
              />
            </div>
            <div>
              <h4 className="total-paid">TOTAL PAID</h4>
              <strong>
                &#x20B9; {payment.cash + payment.card + payment.UPI}
              </strong>
            </div>
          </ul>
        </div>
        <br />
        <br />
        <footer>
          <section>
            <div className="bank-name">
              Bank of Maharashtra A/c No. 60386889626
            </div>
            <div className="signatory-name">For EUREKA TYRES</div>
            <br />
            <div className="bank-details">
              RTGS-NEFT-IFSC Code - MAHB0001291
            </div>
            <div className="signature"></div>
          </section>
          <br />
          <br />
          <section>
            <div className="eoe">E. &#38; O. E.</div>
            <div className="signatory">Authorised Signatory</div>
            <div style={{ clear: "both" }}></div>
          </section>
        </footer>
      </div>

      <div className="right-buttons-container">
        <Button
          size="large"
          type="default"
          onClick={onCancel}
          icon={<CloseCircleFilled />}
        />
        <Button
          type="default"
          loading={loading}
          disabled={
            savedInvoiceStatus === "paid" || savedInvoiceStatus === "cancelled"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (!updateMode) {
              handleConfirmOrder(e);
            } else {
              handleUpdateInvoiceStatus(invoiceStatus);
            }
          }}
        >
          {updateMode ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}

export default Invoice;
