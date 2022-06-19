import React, { useState, useRef, useReducer, useEffect, useMemo } from "react";
import "./UpdateStock.css";
import PurchaseInvoice from "./PurchaseInvoice";
import InvoiceWithNewItems from "./InvoiceWithNewItems.js";
import { Modal } from "antd";
import { useTransition, animated } from "@react-spring/web";

function invoicesReducer(invoices, action) {
  switch (action.type) {
    case "SET_INVOICES": {
      return action.value;
    }

    case "UPDATE_INVOICE_FIELD": {
      return invoices.map((invoice) => {
        if (invoice.invoice_number === action.invoiceNumber) {
          const updatedInvoice = {
            ...invoice,
            [action.field]: action.value,
          };
          return updatedInvoice;
        }
        return invoice;
      });
    }

    case "UPDATE_CLAIM_OVERWRITE_SPECIAL": {
      return invoices.map((invoice) => {
        if (invoice.invoice_number === action.invoiceNumber) {
          const updatedInvoice = {
            ...invoice,
            claim_invoice: false,
            overwrite_price_list: false,
            special_discount: false,
          };
          updatedInvoice[action.field] = action.value;
          return updatedInvoice;
        }
        return invoice;
      });
    }

    case "UPDATE_CLAIM_NUMBER": {
      return invoices.map((invoice) => {
        if (invoice.invoice_number === action.invoiceNumber) {
          const updatedInvoice = {
            ...invoice,
            claim_items: invoice.claim_items.map((item, index) => {
              if (index === action.claimIndex) {
                const updatedItem = { ...item, claim_number: action.value };
                return updatedItem;
              }
              return item;
            }),
          };
          return updatedInvoice;
        }
        return invoice;
      });
    }

    case "APPEND_INVOICE": {
      return [...invoices, action.newInvoice];
    }

    default:
      return invoices;
  }
}

function invoicesWithNewItemsReducer(invoices, action) {
  switch (action.type) {
    case "SET_INVOICES": {
      return action.value;
    }

    case "UPDATE_ITEM_STATUS": {
      console.log(action);
      return invoices.map((invoice) => {
        if (invoice.invoice_number === action.invoiceNumber) {
          const updatedInvoice = {
            ...invoice,
            items: invoice.items.map((item) => {
              if (item.item_code === action.itemCode) {
                const updatedItem = { ...item, not_found_in_inventory: false };
                return updatedItem;
              }
              return item;
            }),
          };
          return updatedInvoice;
        }
        return invoice;
      });
    }

    case "DELETE_INVOICE": {
      return invoices.filter(
        (invoice) => invoice.invoice_number !== action.invoiceNumber
      );
    }

    default:
      return invoices;
  }
}

function UpdateStock() {
  const [invoices, dispatchInvoices] = useReducer(invoicesReducer, []);
  const [invoicesWithNewItems, dispatchInvoicesWithNewItems] = useReducer(
    invoicesWithNewItemsReducer,
    []
  );
  const [existingInvoices, setExistingInvoices] = useState([]);
  const inputFileRef = useRef();
  const transitionProps = useMemo(
    () => ({
      keys: (invoice) => invoice.invoice_number,
      trail: 200,
      config: { mass: 1, tension: 500, friction: 40, clamp: true },
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    }),
    []
  );
  const invoicesWithNewItemsTransitions = useTransition(
    invoicesWithNewItems,
    transitionProps
  );
  const invoicesTransitions = useTransition(invoices, transitionProps);

  useEffect(() => {
    function readyToConvert(invoiceWithNewItems) {
      return invoiceWithNewItems.items.every(
        (item) => item.not_found_in_inventory === false
      );
    }
    const invoiceToConvert = invoicesWithNewItems.find(readyToConvert);
    if (invoiceToConvert) {
      convertToNormalInvoice(invoiceToConvert);
    }

    async function convertToNormalInvoice(invoiceToConvert) {
      let body = {
        invoice_number: invoiceToConvert.invoice_number,
        items: invoiceToConvert.items,
      };
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };

      try {
        const response = await fetch("api/process_invoice", requestOptions);
        const result = await response.json();
        if (response.ok) {
          let convertedInvoice = result;
          dispatchInvoicesWithNewItems({
            type: "DELETE_INVOICE",
            invoiceNumber: convertedInvoice.invoice_number,
          });
          dispatchInvoices({
            type: "APPEND_INVOICE",
            newInvoice: convertedInvoice,
          });
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  }, [invoicesWithNewItems]);

  const changeHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const file of e.target.files) {
      formData.append("files[]", file, file.name);
    }

    const requestOptions = {
      method: "POST",
      body: formData,
    };

    const submitInvoice = async () => {
      try {
        const response = await fetch("/api/read_invoice", requestOptions);
        const result = await response.json();
        if (response.ok) {
          dispatchInvoices({
            type: "SET_INVOICES",
            value: result.invoices,
          });
          dispatchInvoicesWithNewItems({
            type: "SET_INVOICES",
            value: result.invoices_with_new_products,
          });
          setExistingInvoices(result.invoices_already_exist);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    submitInvoice();
  };

  const handleUpdateStock = () => {
    //if price not matching, and user hasn't selected claim or overwrite price, then do not post
    let selectOneError = false;
    let claimNumberError = false;
    let specialDiscountError = false;
    for (let i = 0; i < invoices.length; i++) {
      let priceDiff =
        Math.round(invoices[i].invoice_total) -
        Math.round(invoices[i].price_list_total);
      if (
        priceDiff < 0 &&
        !invoices[i].claim_invoice &&
        !invoices[i].overwrite_price_list &&
        !invoices[i].special_discount
      ) {
        selectOneError = true;
        Modal.warning({
          content: `Invoice number: ${invoices[i].invoice_number}, select either claim invoice or special discount or overwrite price list`,
        });
        break;
      }
      if (priceDiff && invoices[i].claim_invoice) {
        for (let j = 0; j < invoices[i].claim_items.length; j++) {
          if (
            invoices[i].claim_items[j].claim_number === "" ||
            invoices[i].claim_items[j].claim_number === 0
          ) {
            claimNumberError = true;
            Modal.warning({
              content: `Invoice number: ${invoices[i].invoice_number}, Please fill claim number`,
            });
            break;
          }
        }
      }
      if (
        priceDiff &&
        invoices[i].special_discount &&
        invoices[i].special_discount_type.trim() === ""
      ) {
        specialDiscountError = true;
        Modal.warning({
          content: `Invoice number: ${invoices[i].invoice_number}, Please fill special discount name`,
        });
        break;
      }
    }
    if (!selectOneError && !claimNumberError && !specialDiscountError) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoices),
      };
      fetch("/api/update_stock", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          handleClearInvoices();
          Modal.success({
            content: result,
          });
        });
    }
  };

  function handleClearInvoices() {
    inputFileRef.current.value = "";
    dispatchInvoices({
      type: "SET_INVOICES",
      value: [],
    });
    dispatchInvoicesWithNewItems({
      type: "SET_INVOICES",
      value: [],
    });
    setExistingInvoices([]);
  }

  console.log("invoices", invoices);
  console.log("invoices with new items", invoicesWithNewItems);
  console.log("existing invoices", existingInvoices);

  return (
    <div className="update-stock">
      <h3>Upload purchase invoices</h3>
      <form method="POST" action="" encType="multipart/form-data">
        <p>
          <input
            type="file"
            disabled={
              invoices.length !== 0 ||
              invoicesWithNewItems.length !== 0 ||
              existingInvoices.length !== 0
            }
            name="files"
            multiple
            onChange={changeHandler}
            ref={inputFileRef}
          />
        </p>
      </form>
      <button
        disabled={
          invoices.length === 0 &&
          invoicesWithNewItems.length === 0 &&
          existingInvoices.length === 0
        }
        onClick={handleClearInvoices}
      >
        Clear
      </button>

      {existingInvoices.length !== 0 ? (
        <div>
          <br />
          <h3>Invoices already uploaded</h3>
          <hr />
        </div>
      ) : null}
      <div className="existing-invoices">
        {existingInvoices.map((invoice) => (
          <h4 key={invoice.invoice_number}>
            Invoice No. {invoice.invoice_number}
          </h4>
        ))}
      </div>

      {invoicesWithNewItems.length !== 0 ? (
        <div>
          <br />
          <h3>Invoices With New Items</h3>
          <p>Add the new items to inventory before proceeding </p>
          <hr />
        </div>
      ) : null}
      <div className="invoices-with-new-items">
        {invoicesWithNewItemsTransitions((styles, invoice) => (
          <animated.div style={styles}>
            <InvoiceWithNewItems
              key={invoice.invoice_number}
              invoice={invoice}
              dispatchInvoicesWithNewItems={dispatchInvoicesWithNewItems}
            ></InvoiceWithNewItems>
          </animated.div>
        ))}
      </div>
      {invoicesWithNewItems.length !== 0 || invoices.length !== 0 ? (
        <div>
          <br />
          <h3>Invoices</h3>
          <hr />
        </div>
      ) : null}
      <div className="invoices">
        {invoicesTransitions((styles, invoice) => (
          <animated.div style={styles}>
            <PurchaseInvoice
              key={invoice.invoice_number}
              invoice={invoice}
              dispatchInvoices={dispatchInvoices}
            />
          </animated.div>
        ))}
      </div>

      {invoices.length !== 0 ||
      invoicesWithNewItems.length !== 0 ||
      existingInvoices.length !== 0 ? (
        <button
          disabled={
            invoicesWithNewItems.length !== 0 ||
            (existingInvoices.length !== 0 &&
              invoices.length === 0 &&
              invoicesWithNewItems.length === 0)
          }
          className="update-inventory"
          onClick={handleUpdateStock}
        >
          Update inventory and save invoices
        </button>
      ) : null}
      <br />

      <br />
    </div>
  );
}

export default UpdateStock;
