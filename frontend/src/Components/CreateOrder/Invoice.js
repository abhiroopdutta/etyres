import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import "./Invoice.css";

function Invoice({ cart, services, hideInvoice }) {
  const [invoiceNumber, setInvoiceNumber] = useState();
  //manual invoice date entry for initial setup of software
  const [invoiceDate, setInvoiceDate] = useState(() => {
    let today_date = new Date().toISOString().slice(0, 10).split("-");
    let date = today_date[0] + "-" + today_date[1] + "-" + today_date[2];
    return date;
  });
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    GSTIN: "",
    stateCode: "",
    state: "",
    vehicleNumber: "",
    contact: "",
  });
  const [GSTTable, setGSTTable] = useState();
  const [IGSTTable, setIGSTTable] = useState();
  const [noTaxTable, setNoTaxTable] = useState();
  const [isTaxInvoice, setIsTaxInvoice] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  //render different tables depending on IGST customer or not
  const [IGSTRender, SetIGSTRender] = useState(false);

  //Get invoice number from backend
  useEffect(() => {
    fetch("/api/sales_invoice_number")
      .then((res) => res.json())
      .then((number) => setInvoiceNumber(number));
  }, []);

  useEffect(() => {
    let data = {
      products: cart,
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
          setNoTaxTable(result.non_tax_table);
        } else {
          throw Error(result);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      }
    };

    getTableData();
  }, [cart, services]);

  //if customer GSTIN doesn't start with 09, then IGST
  const handleIGST = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });

    if (
      e.target.value === "0" ||
      e.target.value.startsWith("09") ||
      !e.target.value
    ) {
      SetIGSTRender(false);
    } else {
      SetIGSTRender(true);
    }
  };

  const handleInvoiceDate = (e) => {
    setInvoiceDate(e.target.value);
    console.log(e.target.value);
  };

  const handleCustomerDetails = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmOrder = () => {
    //prepare full invoice data to send to backend
    let invoiceData = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
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
          alert(result);
          setOrderConfirmed(true);
        } else {
          throw Error(result);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      }
    };

    place_order();
  };

  const toggleTaxInvoice = () => {
    setIsTaxInvoice((isTaxInvoice) => !isTaxInvoice);
  };

  const componentRef = useRef(null);
  const handlePrintInvoice = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="invoice">
      <div className="left-buttons-container">
        <button
          className="pdf-button"
          disabled={!orderConfirmed}
          onClick={handlePrintInvoice}
        >
          Save PDF
        </button>

        <div className="tax-invoice-button">
          <label htmlFor="tax-invoice">Tax Invoice</label>
          <input id="tax-invoice" type="checkbox" onChange={toggleTaxInvoice} />
        </div>
      </div>

      <div ref={componentRef} className="invoice-body">
        <div className="invoice-header">
          <header className="shop-details">
            <h4>EUREKA TYRES</h4>
            <h4>APOLLO PV ZONE</h4>
            <br />
            <address>
              <p>GSTIN: 09FWTPD4101B1ZT</p>
              <p>State: Uttar Pradesh, Code:09</p>
              <p>52/42/6A, Tashkand Marg, Civil Lines, Allahabad</p>
              <p>Uttar Pradesh - 211001 | +91 94355 55596</p>
            </address>
          </header>

          <header className="invoice-details">
            <h4> Tax Invoice # {invoiceNumber}</h4>
            <h4>
              Invoice Date:{" "}
              <input
                type="date"
                value={invoiceDate}
                required="required"
                onChange={(e) => handleInvoiceDate(e)}
              />
            </h4>
            <label htmlFor="invoice_status">Invoice status: </label>
            <select id="invoice_status" name="invoice_status">
              <option value="paid">paid</option>
              <option value="due">due</option>
            </select>
          </header>
        </div>
        <br />
        <hr />
        <br />
        <br />
        <div className="customer-details">
          <label htmlFor="name">Bill To: </label>
          <input
            id="name"
            name="name"
            className="name"
            type="text"
            value={customerDetails.name}
            onChange={handleCustomerDetails}
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
          />
          <br />
          {isTaxInvoice ? (
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
              />
              <br />
              <label htmlFor="stateCode">Code: </label>
              <input
                id="stateCode"
                name="stateCode"
                className="stateCode"
                type="text"
                value={customerDetails.stateCode}
                onChange={handleCustomerDetails}
                maxLength="2"
              />
              <label htmlFor="state">State: </label>
              <input
                id="state"
                name="state"
                className="state"
                type="text"
                value={customerDetails.state}
                onChange={handleCustomerDetails}
              />
              <br />
            </section>
          ) : null}
          <label htmlFor="vehicleNumber">Vehicle No. : </label>
          <input
            id="vehicleNumber"
            name="vehicleNumber"
            className="vehicleNumber"
            type="text"
            value={customerDetails.vehicleNumber}
            onChange={handleCustomerDetails}
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
          />
        </div>

        <br />

        {isTaxInvoice ? (
          <div className="tax-invoice">
            {IGSTRender ? (
              <div className="IGST">
                <table className="IGST-table">
                  <thead>
                    <tr>
                      <th className="particulars" rowSpan="2">
                        Particulars
                      </th>
                      <th className="HSNCode" rowSpan="2">
                        HSN-Code
                      </th>
                      <th className="Qty" rowSpan="2">
                        Qty
                      </th>
                      <th className="Rate-per-item" rowSpan="2">
                        Rate per Item
                      </th>
                      <th className="taxable-value" rowSpan="2">
                        Taxable value
                      </th>
                      <th colSpan="2" scope="colgroup">
                        IGST
                      </th>
                      <th className="value" rowSpan="2">
                        Value
                      </th>
                    </tr>
                    <tr>
                      <th scope="col">Rate</th>
                      <th scope="col">Amt</th>
                    </tr>
                  </thead>

                  <tbody>
                    {IGSTTable.products.map((tyre, index) => (
                      <tr key={tyre.itemCode}>
                        <td>{tyre.itemDesc}</td>
                        <td>{tyre.HSN}</td>
                        <td>{tyre.quantity}</td>
                        <td>{tyre.ratePerItem}</td>
                        <td>{tyre.taxableValue}</td>
                        <td className="IGST-cell">
                          {Math.round(tyre.IGST * 100)}%
                        </td>
                        <td> {tyre.IGSTAmount} </td>
                        <td>{tyre.value}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th>Net Amount</th>
                      <td>-</td>
                      <td>{IGSTTable.total.quantity}</td>
                      <td>-</td>
                      <td>{IGSTTable.total.taxableValue}</td>
                      <td>-</td>
                      <td>{IGSTTable.total.IGSTAmount}</td>
                      <td>{IGSTTable.total.value}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
                <table className="rounding-table">
                  <thead>
                    <tr>
                      <th>Rounding off</th>
                      <td>{IGSTTable.invoiceRoundOff}</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Total</th>
                      <td>
                        <strong>&#x20B9;{IGSTTable.invoiceTotal}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="GST">
                <table className="GST-table">
                  <thead>
                    <tr>
                      <th className="particulars" rowSpan="2">
                        Particulars
                      </th>
                      <th className="HSNCode" rowSpan="2">
                        HSN-Code
                      </th>
                      <th className="Qty" rowSpan="2">
                        Qty
                      </th>
                      <th className="Rate-per-item" rowSpan="2">
                        Rate per Item
                      </th>
                      <th className="taxable-value" rowSpan="2">
                        Taxable value
                      </th>
                      <th colSpan="2" scope="colgroup">
                        CGST
                      </th>
                      <th colSpan="2" scope="colgroup">
                        SGST
                      </th>
                      <th className="value" rowSpan="2">
                        Value
                      </th>
                    </tr>
                    <tr>
                      <th scope="col">Rate</th>
                      <th scope="col">Amt</th>
                      <th scope="col">Rate</th>
                      <th scope="col">Amt</th>
                    </tr>
                  </thead>

                  <tbody>
                    {GSTTable.products.map((tyre, index) => (
                      <tr key={tyre.itemCode}>
                        <td>{tyre.itemDesc}</td>
                        <td>{tyre.HSN}</td>
                        <td>{tyre.quantity}</td>
                        <td>{tyre.ratePerItem}</td>
                        <td>{tyre.taxableValue}</td>
                        <td>{Math.round(tyre.CGST * 100)}%</td>
                        <td>{tyre.CGSTAmount}</td>
                        <td>{Math.round(tyre.SGST * 100)}%</td>
                        <td>{tyre.SGSTAmount}</td>
                        <td>{tyre.value}</td>
                      </tr>
                    ))}

                    {GSTTable.services.map((service, index) => (
                      <tr key={service.name}>
                        <td>{service.name}</td>
                        <td>{service.HSN}</td>
                        <td>{service.quantity}</td>
                        <td>{service.ratePerItem}</td>
                        <td>{service.taxableValue}</td>
                        <td>{Math.round(service.CGST * 100)}%</td>
                        <td>{service.CGSTAmount}</td>
                        <td>{Math.round(service.SGST * 100)}%</td>
                        <td>{service.SGSTAmount}</td>
                        <td>{service.value}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th>Net Amount</th>
                      <td>-</td>
                      <td>{GSTTable.total.quantity}</td>
                      <td>-</td>
                      <td>{GSTTable.total.taxableValue}</td>
                      <td>-</td>
                      <td>{GSTTable.total.CGSTAmount}</td>
                      <td>-</td>
                      <td>{GSTTable.total.SGSTAmount}</td>
                      <td>{GSTTable.total.value}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
                <table className="rounding-table">
                  <thead>
                    <tr>
                      <th>Rounding off</th>
                      <td>{GSTTable.invoiceRoundOff}</td>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <th>Total</th>
                      <td>
                        <strong>&#x20B9;{GSTTable.invoiceTotal}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <table className="no-tax-invoice">
              <thead>
                <tr>
                  <th className="particulars">Particulars</th>
                  <th className="unit-price">Unit Price</th>
                  <th className="Qty">Qty</th>
                  <th className="value">Value</th>
                </tr>
              </thead>

              <tbody>
                {noTaxTable?.products.map((product) => (
                  <tr key={product.itemCode}>
                    <td>{product.itemDesc}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.value}</td>
                  </tr>
                ))}

                {noTaxTable?.services.map((service) => (
                  <tr key={service.name}>
                    <td>{service.name}</td>
                    <td>{service.price}</td>
                    <td>{service.quantity}</td>
                    <td>{service.value}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th>Net Amount</th>
                  <td>-</td>
                  <td>{noTaxTable?.total.quantity}</td>
                  <td>{noTaxTable?.total.value}</td>
                </tr>
              </tfoot>
            </table>
            <br />
            <table className="rounding-table">
              <thead>
                <tr>
                  <th>Rounding off</th>
                  <td>{noTaxTable?.invoiceRoundOff}</td>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th>Total</th>
                  <td>
                    <strong>&#x20B9;{noTaxTable?.invoiceTotal}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <br />
        <br />
        <br />
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
        <button
          className="close-invoice"
          onClick={() => hideInvoice(orderConfirmed)}
        >
          x
        </button>
        <button
          className="print-button"
          disabled={orderConfirmed}
          onClick={handleConfirmOrder}
        >
          CONFIRM ORDER
        </button>
      </div>
    </div>
  );
}

export default Invoice;
