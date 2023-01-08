import { useState } from "react";
import "./InvoiceWithNewItems.css";
import AddItem from "./AddItem";
import React from "react";
import { Button } from "antd";

function InvoiceWithNewItems({ invoice, dispatchInvoicesWithNewItems }) {
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState();

  const toggleModal = (state) => {
    setShowModal(state);
  };

  const handleUpdateInventory = (item) => {
    setItem(item);
    toggleModal(true);
  };

  return (
    <div className="invoice-with-new-items">
      <header>
        <h4 className="invoice-number">Invoice no. {invoice.invoice_number}</h4>
      </header>
      <hr className="invoice-with-new-items-hr" />
      <div className="invoice-with-new-items-table-wrapper">
        <table className="invoice-with-new-items-table">
          <thead>
            <tr>
              <th>S.no.</th>
              <th>Item Desc</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Inventory</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.item_code}>
                <td>{index + 1}</td>
                <td>{item.item_desc}:</td>
                <td>{item.quantity}</td>
                <td>{item.item_total}</td>
                <td>
                  {item.not_found_in_inventory ? (
                    <Button
                      type="primary"
                      className="add-to-inventory-button"
                      onClick={() => handleUpdateInventory(item)}
                    >
                      +
                    </Button>
                  ) : (
                    <div>&#9989;</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
        <div>
          <AddItem
            visible={showModal}
            invoiceNumber={invoice.invoice_number}
            item={item}
            toggleModal={toggleModal}
            dispatchInvoicesWithNewItems={dispatchInvoicesWithNewItems}
          />
        </div>}
    </div>
  );
}

export default InvoiceWithNewItems;
