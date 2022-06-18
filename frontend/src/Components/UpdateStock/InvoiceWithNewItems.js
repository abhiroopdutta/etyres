import { useState } from "react";
import "./InvoiceWithNewItems.css";
import AddItem from "./AddItem";
import React from "react";
import { useTransition, animated } from "@react-spring/web";

function InvoiceWithNewItems({ invoice, dispatchInvoicesWithNewItems }) {
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState();
  const transitions = useTransition(showModal, {
    config: { mass: 1, tension: 500, friction: 40, clamp: true },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

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
                  <button
                    className="add-to-inventory-button"
                    onClick={() => handleUpdateInventory(item)}
                  >
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

      {transitions((styles, showModal) =>
        showModal ? (
          <animated.div style={styles}>
            <AddItem
              invoiceNumber={invoice.invoice_number}
              item={item}
              toggleModal={toggleModal}
              dispatchInvoicesWithNewItems={dispatchInvoicesWithNewItems}
            />
          </animated.div>
        ) : null
      )}
    </div>
  );
}

export default InvoiceWithNewItems;
