import { useState } from "react";
import "./InvoiceWithNewItems.css";
import AddItem from "./AddItem";
import React from "react";

function InvoiceWithNewItems({ invoice, updateItemStatus }) {
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
        <strong className="invoice-number">
          Invoice no. {invoice.invoice_number}
        </strong>
      </header>
      <hr className="invoice-with-new-items-hr" />
      <table className="invoice-with-new-items-table">
        <thead>
          <tr>
            <th>S.no.</th>
            <th>Item Desc</th>
            <th>Qty</th>
            <th>Price</th>
            <th>inventory</th>
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
                  <button onClick={() => handleUpdateInventory(item)}>
                    Add to inventory
                  </button>
                ) : (
                  <div>&#9989;</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal ? (
        <AddItem
          invoiceNumber={invoice.invoice_number}
          item={item}
          toggleModal={toggleModal}
          updateItemStatus={updateItemStatus}
        />
      ) : null}
    </div>
  );
}

export default InvoiceWithNewItems;
