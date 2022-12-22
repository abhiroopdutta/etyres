import React from "react";
import "./PurchaseInvoice.css";

function PurchaseInvoice({ invoice, dispatchInvoices }) {
  let priceDifference = Math.round(invoice.invoice_total) - Math.round(invoice.price_list_total);

  let price_match_component;
  if (priceDifference > 0) {
    price_match_component = (
      <div>
        Invoice Total is <strong>greater</strong> by &#8377;
        {Math.abs(priceDifference)} &#10060;
      </div>
    );
  } else if (priceDifference < 0) {
    price_match_component = (
      <div>
        Invoice Total is <strong>lesser</strong> by &#8377;
        {Math.abs(priceDifference)} &#10060;
      </div>
    );
  } else if (priceDifference === 0) {
    price_match_component = <div>Price match &#9989; </div>;
  }

  return (
    <div className="purchase-invoice">
      <header className="purchase-invoice-header">
        <h4 className="purchase-invoice-number">
          Invoice No. {invoice.invoice_number}
        </h4>
        <div className="invoice-date">
          <label htmlFor={"invoice-date" + invoice.invoice_number}>
            Invoice Date:
          </label>
          <input
            id={"invoice-date" + invoice.invoice_number}
            type="date"
            value={invoice.invoice_date}
            required="required"
            onChange={(e) =>
              dispatchInvoices({
                type: "UPDATE_INVOICE_FIELD",
                invoiceNumber: invoice.invoice_number,
                field: "invoice_date",
                value: e.target.value,
              })
            }
          />
        </div>
      </header>
      <hr className="purchase-invoice-hr" />

      {priceDifference && invoice.special_discount ? (
        <div className="special-discount">
          <label htmlFor={"special_discount_type" + invoice.invoice_number}>
            Discount Type:
          </label>
          <input
            type="text"
            value={invoice.special_discount_type}
            id={"special_discount_type" + invoice.invoice_number}
            onChange={(e) =>
              dispatchInvoices({
                type: "UPDATE_INVOICE_FIELD",
                invoiceNumber: invoice.invoice_number,
                field: "special_discount_type",
                value: e.target.value,
              })
            }
            placeholder="ex - LVD"
          />
        </div>
      ) : null}
      {priceDifference > 0 ? (
        <section
          className="claim-overwrite"
          onChange={(e) =>
            dispatchInvoices({
              type: "UPDATE_INVOICE_FIELD",
              invoiceNumber: invoice.invoice_number,
              field: "overwrite_price_list",
              value: e.target.checked,
            })
          }
        >
          <input
            className="overwrite-checkbox"
            type="checkbox"
            id={"overwrite-checkbox" + invoice.invoice_number}
          />
          <label htmlFor={"overwrite-checkbox" + invoice.invoice_number}>
            Overwrite price list
          </label>
        </section>
      ) : priceDifference < 0 ? (
        <section
          className="claim-overwrite"
          onChange={(e) =>
            dispatchInvoices({
              type: "UPDATE_CLAIM_OVERWRITE_SPECIAL",
              invoiceNumber: invoice.invoice_number,
              field: e.target.className,
              value: true,
            })
          }
        >
          <input
            type="radio"
            className="claim_invoice"
            name={"claim_overwrite" + invoice.invoice_number}
            id={"claim_invoice" + invoice.invoice_number}
            required
          />
          <label htmlFor={"claim_invoice" + invoice.invoice_number}>
            Claim Invoice
          </label>
          <br />
          <input
            type="radio"
            className="overwrite_price_list"
            name={"claim_overwrite" + invoice.invoice_number}
            id={"overwrite_price_list" + invoice.invoice_number}
            required
          />
          <label htmlFor={"overwrite_price_list" + invoice.invoice_number}>
            Overwrite Price List
          </label>
          <br />
          <input
            type="radio"
            className="special_discount"
            name={"claim_overwrite" + invoice.invoice_number}
            id={"special_discount" + invoice.invoice_number}
            required
          />
          <label htmlFor={"special_discount" + invoice.invoice_number}>
            Special Discount
          </label>
          <br />
        </section>
      ) : null}

      <div className="purchase-invoice-table-wrapper">
        <table className="purchase-invoice-table">
          <thead>
            <tr>
              <th>S.no.</th>
              <th>Item Desc</th>
              <th>Qty</th>
              <th>Price</th>
              {invoice.claim_invoice ? <th>Claim No.</th> : null}
            </tr>
          </thead>
          {/* It is safe to use item_index as key here since the claim_items array doesn't change, but fix it in future */}
          <tbody>
            {invoice.claim_invoice
              ? invoice.claim_items.map((service, claim_item_index) => (
                <tr key={claim_item_index}>
                  <td>{claim_item_index + 1}</td>
                  <td>{service.item_desc}:</td>
                  <td>{service.quantity}</td>
                  <td>{service.item_total}</td>
                  <td className="claim-number">
                    <input
                      type="text"
                      placeholder="claim number"
                      onChange={(e) =>
                        dispatchInvoices({
                          type: "UPDATE_CLAIM_NUMBER",
                          invoiceNumber: invoice.invoice_number,
                          field: "",
                          value: e.target.value,
                          claimIndex: claim_item_index,
                        })
                      }
                    />
                  </td>
                </tr>
              ))
              : invoice.items.map((service, item_index) => (
                <tr key={service.item_code}>
                  <td>{item_index + 1}</td>
                  <td>{service.item_desc}:</td>
                  <td>{service.quantity}</td>
                  <td>{service.item_total}</td>
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr>
              <th colSpan="3">Total</th>
              <th>{invoice.invoice_total}</th>
              {invoice.claim_invoice ? <th></th> : null}
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="invoice-price-difference">
        {price_match_component}
      </section>

      <br />
    </div>
  );
}

export default PurchaseInvoice;
