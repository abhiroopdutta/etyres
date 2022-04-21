import { useEffect, useState } from "react";
import "./InvoiceWithNewItems.css";
import AddItem from "./AddItem";
import React from "react";

function InvoiceWithNewItems({
  initial_invoice,
  invoiceIndex,
  convertToNormalInvoice,
}) {
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState();
  const [invoice, setInvoice] = useState(initial_invoice);

  useEffect(() => {
    let notFoundInInventory = invoice.items.find(
      (item) => item.not_found_in_inventory === true
    );

    if (!notFoundInInventory) {
      convertToNormalInvoice(invoice);
    }
  }, [invoice]);

  const toggleModal = (state) => {
    setShowModal(state);
  };

  const handleUpdateInventory = (item) => {
    setItem(item);
    toggleModal(true);
  };

  const updateItemStatus = (new_item) => {
    let invoiceCopy = { ...invoice };
    let itemIndex = invoiceCopy.items.findIndex(
      (item) => item.item_code === new_item.item_code
    );
    invoiceCopy.items[itemIndex].not_found_in_inventory = false;
    setInvoice(invoiceCopy);
  };

  return (
    <div className="invoice-with-new-items">
      <header>
        <strong className="invoice-number">
          Invoice no. {invoice.invoice_number}
        </strong>
      </header>
      <hr />
      <table className="invoice-item-headers">
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
            <tr key={index}>
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
          item={item}
          toggleModal={toggleModal}
          updateItemStatus={updateItemStatus}
        />
      ) : null}
    </div>
  );
}

export default InvoiceWithNewItems;
