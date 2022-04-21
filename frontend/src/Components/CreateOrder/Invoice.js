import React, { useContext, useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";

import { CartContext } from "./CartContext";
import "./Invoice.css";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function Invoice({ showInvoice }) {
  const { tyresContext, servicesContext } = useContext(CartContext);
  // eslint-disable-next-line
  const [cart, setCart] = tyresContext;
  // eslint-disable-next-line
  const [services, setServices] = servicesContext;
  const [isTaxInvoice, setIsTaxInvoice] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    GSTIN: "",
    stateCode: "",
    state: "",
    vehicleNumber: "",
    contact: "",
  });

  //store rate per item in backend
  const [purchasedProducts, setPurchasedProducts] = useState(
    cart.map((product) => {
      return {
        type: "product",
        itemDesc: product.itemDesc,
        itemCode: product.itemCode,
        HSN: product.HSN,
        category: product.category,
        size: product.size,
        costPrice: parseFloat(product.costPrice),
        ratePerItem: roundToTwo(
          parseFloat(product.price) / (parseFloat(product.GST) + parseFloat(1))
        ),
        quantity: parseInt(product.quantity),
        CGST: roundToTwo(parseFloat(parseFloat(product.GST) / 2)),
        SGST: roundToTwo(parseFloat(parseFloat(product.GST) / 2)),
        IGST: parseFloat(0),
      };
    })
  );

  //give unique id for each service
  const [purchasedServices, setPurchasedServices] = useState(
    services
      .filter((service) => {
        return service.quantity > 0;
      })
      .map((service) => {
        return {
          type: "service",
          name: service.name,
          HSN: service.HSN,
          ratePerItem: roundToTwo(parseFloat(service.price) / 1.18),
          quantity: parseInt(service.quantity),
          CGST: 0.09,
          SGST: 0.09,
        };
      })
  );

  //render different tables depending on IGST customer or not
  const [IGSTRender, SetIGSTRender] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState();
  //manual invoice date entry for initial setup of software
  const [invoiceDate, setInvoiceDate] = useState(() => {
    let today_date = new Date().toISOString().slice(0, 10).split("-");
    let date = today_date[0] + "-" + today_date[1] + "-" + today_date[2];
    return date;
  });

  useEffect(() => {
    fetch("/api/sales_invoice_number")
      .then((res) => res.json())
      .then((number) => setInvoiceNumber(number));
  }, []);

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

  //if customer GSTIN doesn't start with 09, then IGST
  const handleIGST = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
    let purchasedProductsCopy = [...purchasedProducts];

    if (
      e.target.value === "0" ||
      e.target.value.startsWith("09") ||
      !e.target.value
    ) {
      for (let i = 0; i < purchasedProductsCopy.length; i++) {
        purchasedProductsCopy[i].IGST = parseFloat(0);
        purchasedProductsCopy[i].CGST = roundToTwo(
          parseFloat(parseFloat(cart[i].GST) / 2)
        );
        purchasedProductsCopy[i].SGST = roundToTwo(
          parseFloat(parseFloat(cart[i].GST) / 2)
        );
      }
      SetIGSTRender(false);
    } else {
      for (let i = 0; i < purchasedProductsCopy.length; i++) {
        purchasedProductsCopy[i].IGST = roundToTwo(parseFloat(cart[i].GST));
        purchasedProductsCopy[i].CGST = parseFloat(0);
        purchasedProductsCopy[i].SGST = parseFloat(0);
      }
      SetIGSTRender(true);
    }

    //comment the below line and state is still updated IGST value, how???!!
    setPurchasedProducts(purchasedProductsCopy);
  };

  //calculate all column values for tyres
  let productsTable = [];
  for (let i = 0; i < purchasedProducts.length; i++) {
    productsTable.push({
      itemDesc: purchasedProducts[i].itemDesc,
      HSN: purchasedProducts[i].HSN,
      quantity: purchasedProducts[i].quantity,
      ratePerItem: purchasedProducts[i].ratePerItem,
      taxableValue: roundToTwo(
        purchasedProducts[i].ratePerItem * purchasedProducts[i].quantity
      ),
      CGSTRate: roundToTwo(purchasedProducts[i].CGST * 100),
      CGSTAmount: parseFloat(0),
      SGSTRate: roundToTwo(purchasedProducts[i].SGST * 100),
      SGSTAmount: parseFloat(0),
      IGSTRate: roundToTwo(purchasedProducts[i].IGST * 100),
      IGSTAmount: parseFloat(0),
      valueForGST: parseFloat(0),
      valueForIGST: parseFloat(0),
    });

    productsTable[i].CGSTAmount = roundToTwo(
      purchasedProducts[i].CGST * productsTable[i].taxableValue
    );
    productsTable[i].SGSTAmount = roundToTwo(
      purchasedProducts[i].SGST * productsTable[i].taxableValue
    );
    productsTable[i].IGSTAmount = roundToTwo(
      purchasedProducts[i].IGST * productsTable[i].taxableValue
    );
    productsTable[i].valueForGST = roundToTwo(
      productsTable[i].taxableValue +
        productsTable[i].CGSTAmount +
        productsTable[i].SGSTAmount
    );
    productsTable[i].valueForIGST = roundToTwo(
      productsTable[i].taxableValue + productsTable[i].IGSTAmount
    );
  }

  //calculate all column values for services
  let servicesTable = [];
  for (let i = 0; i < purchasedServices.length; i++) {
    servicesTable.push({
      name: purchasedServices[i].name,
      HSN: purchasedServices[i].HSN,
      quantity: parseInt(purchasedServices[i].quantity),
      ratePerItem: purchasedServices[i].ratePerItem,
      taxableValue: roundToTwo(
        parseFloat(purchasedServices[i].ratePerItem) *
          purchasedServices[i].quantity
      ),
      CGSTRate: roundToTwo(purchasedServices[i].CGST * 100),
      CGSTAmount: 0,
      SGSTRate: roundToTwo(purchasedServices[i].SGST * 100),
      SGSTAmount: 0,
      value: parseFloat(0),
    });

    servicesTable[i].CGSTAmount = roundToTwo(
      purchasedServices[i].CGST * servicesTable[i].taxableValue
    );
    servicesTable[i].SGSTAmount = roundToTwo(
      purchasedServices[i].SGST * servicesTable[i].taxableValue
    );
    servicesTable[i].value = roundToTwo(
      servicesTable[i].taxableValue +
        servicesTable[i].CGSTAmount +
        servicesTable[i].SGSTAmount
    );
  }

  //calculate total for products (tyres, tubes)
  let totalProductQuantity = 0;
  let totalProductTaxableValue = 0;
  let totalProductCGST = 0;
  let totalProductSGST = 0;
  let totalProductIGST = 0;
  let totalProductValueForGST = 0;
  let totalProductValueForIGST = 0;
  for (let i = 0; i < productsTable.length; i++) {
    totalProductQuantity += productsTable[i].quantity;
    totalProductTaxableValue += productsTable[i].taxableValue;
    totalProductIGST += productsTable[i].IGSTAmount;
    totalProductCGST += productsTable[i].CGSTAmount;
    totalProductSGST += productsTable[i].SGSTAmount;
    totalProductValueForGST += productsTable[i].valueForGST;
    totalProductValueForIGST += productsTable[i].valueForIGST;
  }

  //round off
  totalProductTaxableValue = roundToTwo(totalProductTaxableValue);
  totalProductIGST = roundToTwo(totalProductIGST);
  totalProductCGST = roundToTwo(totalProductCGST);
  totalProductSGST = roundToTwo(totalProductSGST);
  totalProductValueForGST = roundToTwo(totalProductValueForGST);
  totalProductValueForIGST = roundToTwo(totalProductValueForIGST);

  let invoiceRoundOffIGST = roundToTwo(
    Math.round(totalProductValueForIGST) - totalProductValueForIGST
  );
  let invoiceTotalIGST = Math.round(totalProductValueForIGST);

  //calculate total for services
  let totalServiceQuantity = 0;
  let totalServiceTaxableValue = 0;
  let totalServiceCGST = 0;
  let totalServiceSGST = 0;
  let totalServiceValue = 0;
  for (let i = 0; i < servicesTable.length; i++) {
    totalServiceQuantity += servicesTable[i].quantity;
    totalServiceTaxableValue += servicesTable[i].taxableValue;
    totalServiceCGST += servicesTable[i].CGSTAmount;
    totalServiceSGST += servicesTable[i].SGSTAmount;
    totalServiceValue += servicesTable[i].value;
  }

  //round off
  totalServiceTaxableValue = roundToTwo(totalServiceTaxableValue);
  totalServiceCGST = roundToTwo(totalServiceCGST);
  totalServiceSGST = roundToTwo(totalServiceSGST);
  totalServiceValue = roundToTwo(totalServiceValue);

  //calculate absolute total(will be used only for GST since IGST will have total only for tyres)
  let totalQuantity = totalProductQuantity + totalServiceQuantity;
  let totalTaxableValue = roundToTwo(
    totalProductTaxableValue + totalServiceTaxableValue
  );
  let totalCGST = roundToTwo(totalProductCGST + totalServiceCGST);
  let totalSGST = roundToTwo(totalProductSGST + totalServiceSGST);
  let totalValueForGST = roundToTwo(
    totalProductValueForGST + totalServiceValue
  );

  let invoiceRoundOffGST = roundToTwo(
    Math.round(totalValueForGST) - totalValueForGST
  );
  let invoiceTotalGST = Math.round(totalValueForGST);

  const handlePrint = () => {
    //prepare full invoice data to send to backend
    let invoiceData = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      customerDetails: customerDetails,
      products: purchasedProducts,
    };
    if (!IGSTRender) {
      invoiceData["invoiceTotal"] = invoiceTotalGST;
      invoiceData["services"] = purchasedServices;
      invoiceData["invoiceRoundOff"] = invoiceRoundOffGST;
    } else {
      invoiceData["invoiceTotal"] = invoiceTotalIGST;
      invoiceData["services"] = [];
      invoiceData["invoiceRoundOff"] = invoiceRoundOffIGST;
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
    setIsTaxInvoice(!isTaxInvoice);
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
          <input
            name="tax-invoice"
            type="checkbox"
            onChange={toggleTaxInvoice}
          />
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
        {isTaxInvoice ? (
          <div className="customer-details">
            <label htmlFor="name">Bill To: </label>
            <input
              name="name"
              type="text"
              value={customerDetails.name}
              onChange={handleCustomerDetails}
            />
            <br />
            <label htmlFor="address">Address: </label>
            <input
              name="address"
              type="text"
              value={customerDetails.address}
              onChange={handleCustomerDetails}
            />
            <br />
            <label htmlFor="GSTIN">GSTIN: </label>
            <input
              name="GSTIN"
              type="text"
              maxLength="15"
              value={customerDetails.GSTIN}
              onChange={handleIGST}
            />
            <br />
            <label htmlFor="stateCode">Code: </label>
            <input
              name="stateCode"
              type="text"
              value={customerDetails.stateCode}
              onChange={handleCustomerDetails}
              maxLength="2"
            />
            <label htmlFor="state">State: </label>
            <input
              name="state"
              type="text"
              value={customerDetails.state}
              onChange={handleCustomerDetails}
            />
            <br />
            <label htmlFor="vehicleNumber">Vehicle No. : </label>
            <input
              name="vehicleNumber"
              type="text"
              value={customerDetails.vehicleNumber}
              onChange={handleCustomerDetails}
            />
            <br />
            <label htmlFor="contact">Contact: </label>
            <input
              name="contact"
              type="text"
              value={customerDetails.contact}
              onChange={handleCustomerDetails}
            />
          </div>
        ) : null}

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
                    {productsTable.map((tyre, index) => (
                      <tr key={index}>
                        <td>{tyre.itemDesc}</td>
                        <td>{tyre.HSN}</td>
                        <td>{tyre.quantity}</td>
                        <td>{tyre.ratePerItem}</td>
                        <td>{tyre.taxableValue}</td>
                        <td className="IGST-cell">{tyre.IGSTRate}%</td>
                        <td> {tyre.IGSTAmount} </td>
                        <td>{tyre.valueForIGST}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th>Net Amount</th>
                      <td>-</td>
                      <td>{totalProductQuantity}</td>
                      <td>-</td>
                      <td>{totalProductTaxableValue}</td>
                      <td>-</td>
                      <td>{totalProductIGST}</td>
                      <td>{totalProductValueForIGST}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
                <br />
                <table className="rounding-table">
                  <thead>
                    <tr>
                      <th>Rounding off</th>
                      <td>{invoiceRoundOffIGST}</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Total</th>
                      <td>{invoiceTotalIGST}</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <br />
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
                    {productsTable.map((tyre, index) => (
                      <tr key={index}>
                        <td>{tyre.itemDesc}</td>
                        <td>{tyre.HSN}</td>
                        <td>{tyre.quantity}</td>
                        <td>{tyre.ratePerItem}</td>
                        <td>{tyre.taxableValue}</td>
                        <td>{tyre.CGSTRate}%</td>
                        <td>{tyre.CGSTAmount}</td>
                        <td>{tyre.SGSTRate}%</td>
                        <td>{tyre.SGSTAmount}</td>
                        <td>{tyre.valueForGST}</td>
                      </tr>
                    ))}

                    {servicesTable.map((service, index) => (
                      <tr key={index}>
                        <td>{service.name}</td>
                        <td>{service.HSN}</td>
                        <td>{service.quantity}</td>
                        <td>{service.ratePerItem}</td>
                        <td>{service.taxableValue}</td>
                        <td>{service.CGSTRate}%</td>
                        <td>{service.CGSTAmount}</td>
                        <td>{service.SGSTRate}%</td>
                        <td>{service.SGSTAmount}</td>
                        <td>{service.value}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th>Net Amount</th>
                      <td>-</td>
                      <td>{totalQuantity}</td>
                      <td>-</td>
                      <td>{totalTaxableValue}</td>
                      <td>-</td>
                      <td>{totalCGST}</td>
                      <td>-</td>
                      <td>{totalSGST}</td>
                      <td>{totalValueForGST}</td>
                    </tr>
                  </tfoot>
                </table>
                <br />
                <table className="rounding-table">
                  <thead>
                    <tr>
                      <th>Rounding off</th>
                      <td>{invoiceRoundOffGST}</td>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <th>Total</th>
                      <td>{invoiceTotalGST}</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <br />
              </div>
            )}
          </div>
        ) : (
          <div className="no-tax-invoice">
            <table>
              <thead>
                <tr>
                  <th className="particulars">Particulars</th>
                  <th className="Qty">Qty</th>
                  <th className="value">Value</th>
                </tr>
              </thead>

              <tbody>
                {cart.map((tyre, index) => (
                  <tr key={index}>
                    <td>{tyre.itemDesc}</td>
                    <td>{tyre.quantity}</td>
                    <td>{tyre.price}</td>
                  </tr>
                ))}

                {services
                  .filter((service) => {
                    return service.quantity > 0;
                  })
                  .map((service, index) => (
                    <tr key={index}>
                      <td>{service.name}</td>
                      <td>{service.quantity}</td>
                      <td>{service.price}</td>
                    </tr>
                  ))}
              </tbody>

              <tfoot>
                <tr>
                  <th>Net Amount</th>
                  <th>{totalQuantity}</th>
                  <th>{invoiceTotalGST}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

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
        <button className="close-invoice" onClick={() => showInvoice(false)}>
          x
        </button>
        <button
          className="print-button"
          disabled={orderConfirmed}
          onClick={handlePrint}
        >
          CONFIRM ORDER
        </button>
      </div>
    </div>
  );
}

export default Invoice;
