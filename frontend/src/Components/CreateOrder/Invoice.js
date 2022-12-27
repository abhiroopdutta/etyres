import React, { useState, useEffect, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { dayjsLocal } from "../dayjsUTCLocal";
import "./Invoice.css";
import { Modal, Button, AutoComplete } from "antd";
import {
  PrinterFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import gstStateCodes from "./gstStateCodes.json";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useCreateSaleInvoice, useNewSaleInvoiceNumber, useUpdateSaleInvoice, useCustomerList } from "../../api/sale";
import { DebounceInput } from 'react-debounce-input';

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
  const { data: invoiceNumber } = useNewSaleInvoiceNumber({
    enabled: !savedInvoiceNumber,
  })
  const [invoiceDate, setInvoiceDate] = useState(getTodaysDate());
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    GSTIN: "",
    POS: "09",
    vehicleNumber: "",
    contact: "",
  });
  const [customerOptions, setCustomerOptions] = useState([]);
  const { isLoading: isLoadingCustomers, data: customers } = useCustomerList();
  const [payment, setPayment] = useState({ cash: 0, card: 0, UPI: 0 });
  let totalPaid = payment.cash + payment.card + payment.UPI;
  const [taxTable, setTaxTable] = useState({
    GSTTable: null,
    IGSTTable: null
  });
  const { mutate: fetchInvoiceTable } = useMutation({
    mutationFn: postBody => {
      return axios.post('/api/get_gst_tables', postBody);
    },
    onSuccess: (response) =>
      setTaxTable({
        GSTTable: response.data.GST_table,
        IGSTTable: response.data.IGST_table
      })
  })
  let { GSTTable, IGSTTable } = taxTable;
  const { isLoading: isLoadingPlaceOrder, mutate: placeOrder } = useCreateSaleInvoice({
    onSuccess: (response, postBody) => {
      Modal.success({
        content: response.data,
      });
      updateInvoiceInParent(postBody.invoiceNumber);
    }
  });
  const { isLoading: isLoadingUpdateInvoice, mutate: updateInvoice } = useUpdateSaleInvoice({
    onSuccess: (response, postBody) => {
      Modal.success({
        content: response.data,
      });
    },
    onError: (response) => Modal.error({
      content: response.response.data,
    }),
  });
  const [modalClosing, setModalClosing] = useState(false);

  //render different tables depending on IGST customer or not
  let IGSTRender = false;
  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.current,
  });
  const regexGSTINPattern = useMemo(() => {
    let regexStateCode = "(";
    for (let stateCode in gstStateCodes) {
      regexStateCode += stateCode + "|";
    }
    const regexGSTINPattern = regexStateCode.replace(/.$/, ")") + "[A-Z]{5}\\d{4}[A-Z]{1}[A-Z\\d]{1}[Z]{1}[A-Z\\d]{1}";
    return regexGSTINPattern;
  }, []);

  //Get invoice number from backend
  useEffect(() => {
    if (updateMode) {
      setCustomerDetails(savedCustomerDetails);
      setPayment(savedPayment);
      //Saved invoices that have been incorrectly marked as IGST sale
      //will be shown as GST sale but CGST, SGST will show 0
      //correction can be done in such invoices by 
      //adding the field POS=savedCustomerDetails.GSTIN.slice(0,2)
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
    let productItems = products ?? [];
    let serviceItems = services ?? [];
    if (productItems.length > 0 || serviceItems.some(item => item.quantity > 0)) {
      fetchInvoiceTable({
        products: productItems,
        services: serviceItems.filter((service) => {
          return service.quantity > 0;
        }),
      });
    }
  }, [products, services]);

  if (
    customerDetails.POS === "0" ||
    customerDetails.POS?.startsWith("09") ||
    !customerDetails.POS
  ) {
    IGSTRender = false;
  } else {
    IGSTRender = true;
  }

  let due;
  let invoiceStatus = () => {
    //update invoice status depending on payment completed or not
    // status of a paid/cancelled invoice cannot be updated
    if (savedInvoiceStatus === "cancelled") {
      return "cancelled";
    }
    let total;
    if (IGSTRender) {
      total = IGSTTable?.invoiceTotal;
    } else {
      total = GSTTable?.invoiceTotal;
    }
    due = total - totalPaid;
    if (due === 0) {
      return "paid";
    } else if (due > 0) {
      return "due";
    }
  };

  const handleInvoiceClose = () => {
    //if update mode then reset every state to original
    if (updateMode) {
      setInvoiceDate(getTodaysDate());
      setCustomerDetails({
        name: "",
        address: "",
        GSTIN: "",
        vehicleNumber: "",
        contact: "",
        POS: "09"
      });
      setPayment({ cash: 0, card: 0, UPI: 0 });
      setTaxTable({
        GSTTable: null,
        IGSTTable: null
      });
    }
    setModalClosing(false);
    onCancel();
  };

  const handleInvoiceDate = (e) => {
    setInvoiceDate(e.target.value);
  };

  const handleCustomerDetails = (e) => {
    setCustomerDetails((customerDetails) => ({
      ...customerDetails,
      [e.target.name]: e.target.value,
    }));
  };

  const handleConfirmOrder = (e) => {
    //prepare full invoice data to send to backend
    let invoiceData = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      invoiceStatus: invoiceStatus(),
      customerDetails: customerDetails,
      payment: payment,
    };
    if (!IGSTRender) {
      invoiceData["invoiceTotal"] = GSTTable["invoiceTotal"];
      invoiceData["productItems"] = GSTTable["products"];
      invoiceData["serviceItems"] = GSTTable["services"];
      invoiceData["invoiceRoundOff"] = GSTTable["invoiceRoundOff"];
    } else {
      invoiceData["invoiceTotal"] = IGSTTable["invoiceTotal"];
      invoiceData["productItems"] = IGSTTable["products"];
      invoiceData["serviceItems"] = IGSTTable["services"];
      invoiceData["invoiceRoundOff"] = IGSTTable["invoiceRoundOff"];
    }

    placeOrder(invoiceData);
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

    if (due < 0) {
      if (visible) {
        Modal.error({
          content: "Error! Customer has paid more than total payable !",
        });
      }
      return;
    }

    //prepare invoice status update to send to backend
    updateInvoice({
      invoiceNumber: savedInvoiceNumber,
      invoiceStatus: status,
      payment: payment,
    });
  };

  const handleSubmission = (e) => {
    if (!updateMode) {
      handleConfirmOrder(e);
    } else {
      handleUpdateInvoiceStatus(invoiceStatus());
    }
    e.preventDefault();
  };

  const handleSearchCustomer = (searchText) => {

    if (!isLoadingCustomers) {
      setCustomerOptions(
        searchText.length < 4 ? [] :
          customers.filter((customer) => customer.label.toLowerCase().match(searchText.toLowerCase())),
      );
    }

  };

  const handleSetCustomerContact = (value) => {
    setCustomerDetails((customerDetails) => ({
      ...customerDetails,
      contact: value,
    }));
  };

  const onSelectCustomer = (value, option) => {
    setCustomerDetails({
      name: option.name,
      address: option.address,
      GSTIN: option.GSTIN,
      POS: "09",
      vehicleNumber: option.vehicleNumber,
      contact: option.contact,
    });
  };

  return (
    <div
      className={`invoice ${visible ? "open" : "close"} ${modalClosing ? "closing" : ""}`}
      onClick={() => setModalClosing(true)}
      onAnimationEnd={() => {
        if (modalClosing) {
          handleInvoiceClose();
        }
        return;
      }}
    >
      <div className="left-buttons-container">
        <Button
          size="large"
          disabled={!updateMode}
          onClick={(e) => {
            handlePrintInvoice();
            e.stopPropagation();
          }}
          type="primary"
          icon={<PrinterFilled />}
        ></Button>

        <Button
          type="primary"
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
            <h4> Tax Invoice # {updateMode ? savedInvoiceNumber : invoiceNumber}</h4>
            <h4>
              Invoice Date:{" "}
              <input
                type="date"
                value={updateMode ? savedInvoiceDate : invoiceDate}
                required="required"
                disabled={updateMode}
                onChange={(e) => handleInvoiceDate(e)}
              />
            </h4>
            <h4> Invoice Status: {invoiceStatus()}</h4>
          </header>
        </div>
        <hr />

        <form id="invoice-form" onSubmit={handleSubmission}>
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
            <AutoComplete
              style={{ width: "87%" }}
              disabled={updateMode}
              id="contact"
              className="contact"
              value={customerDetails.contact}
              options={customerOptions}
              children={<DebounceInput placeholder={updateMode ? null : "Customer Contact No."} debounceTimeout={300} />}
              onSelect={onSelectCustomer}
              onSearch={handleSearchCustomer}
              onChange={handleSetCustomerContact}
            />
            <br />
            <label htmlFor="GSTIN">GSTIN: </label>
            <input
              id="GSTIN"
              name="GSTIN"
              className="GSTIN"
              type="text"
              maxLength="15"
              value={customerDetails.GSTIN}
              onChange={handleCustomerDetails}
              disabled={updateMode}
              placeholder={updateMode ? null : "Customer GSTIN"}
              pattern={regexGSTINPattern}
            />
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
            <label htmlFor="POS">POS: </label>
            <select
              id="POS"
              name="POS"
              className="POS"
              value="09" //disabling this input temporarily
              onChange={handleCustomerDetails}
              disabled
            >
              {Object.keys(gstStateCodes).map((item) =>
                <option value={item} key={item}>
                  {`${gstStateCodes[item]} (${item})`}
                </option>)}
            </select>
          </div>
        </form>

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
            <div className="rounding-table-container">
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
                  <th>Net Amount</th>
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

        <form id="invoice-form" onSubmit={handleSubmission}>
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
                  &#x20B9; {totalPaid}
                </strong>
              </div>
            </ul>
          </div>
        </form>

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
          type="primary"
          onClick={onCancel}
          icon={<CloseCircleFilled />}
        />
        <Button
          type="primary"
          loading={isLoadingPlaceOrder || isLoadingUpdateInvoice}
          form="invoice-form"
          htmlType="submit"
          disabled={
            savedInvoiceStatus === "paid" || savedInvoiceStatus === "cancelled"
          }
          onClick={(e) => e.stopPropagation()}
        >
          {updateMode ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}

export default Invoice;
