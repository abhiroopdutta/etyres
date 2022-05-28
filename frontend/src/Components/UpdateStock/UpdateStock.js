import React, { useState, useRef, useReducer } from "react";
import "./UpdateStock.css";
import PurchaseInvoice from "./PurchaseInvoice";
import InvoiceWithNewItems from "./InvoiceWithNewItems.js";
import { Modal } from "antd";

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

    default:
      return invoices;
  }
}

function UpdateStock() {
  const [invoices, dispatchInvoices] = useReducer(invoicesReducer, []);
  const [invoicesWithNewItems, setInvoicesWithNewItems] = useState([]);
  const [existingInvoices, setExistingInvoices] = useState([]);
  const inputFileRef = useRef();

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
            invoiceNumber: "",
            field: "",
            value: result.invoices,
          });
          setExistingInvoices(result.invoices_already_exist);
          setInvoicesWithNewItems(result.invoices_with_new_products);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    submitInvoice();
  };

  const handleUpdateStock = () => {
    //   //if price not matching, and user hasn't selected claim or overwrite price, then do not post
    //   let selectOneError = false;
    //   let claimNumberError = false;
    //   let specialDiscountError = false;
    //   for (let i = 0; i < invoices.length; i++) {
    //     let priceDiff =
    //       Math.round(invoices[i].invoice_total) -
    //       Math.round(invoices[i].price_list_total);
    //     if (
    //       priceDiff < 0 &&
    //       !invoices[i].claim_invoice &&
    //       !invoices[i].overwrite_price_list &&
    //       !invoices[i].special_discount
    //     ) {
    //       selectOneError = true;
    //       Modal.warning({
    //         content: `Invoice number: ${invoices[i].invoice_number}, select either claim invoice or special discount or overwrite price list`,
    //       });
    //       break;
    //     }
    //     if (priceDiff && invoices[i].claim_invoice) {
    //       for (let j = 0; j < invoices[i].claim_items.length; j++) {
    //         if (
    //           invoices[i].claim_items[j].claim_number === "" ||
    //           invoices[i].claim_items[j].claim_number === 0
    //         ) {
    //           claimNumberError = true;
    //           Modal.warning({
    //             content: `Invoice number: ${invoices[i].invoice_number}, Please fill claim number`,
    //           });
    //           break;
    //         }
    //       }
    //     }
    //     if (
    //       priceDiff &&
    //       invoices[i].special_discount &&
    //       invoices[i].special_discount_type.trim() === ""
    //     ) {
    //       specialDiscountError = true;
    //       Modal.warning({
    //         content: `Invoice number: ${invoices[i].invoice_number}, Please fill special discount name`,
    //       });
    //       break;
    //     }
    //   }
    //   if (!selectOneError && !claimNumberError && !specialDiscountError) {
    //     const requestOptions = {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(invoices),
    //     };
    //     fetch("/api/update_stock", requestOptions)
    //       .then((response) => response.json())
    //       .then((result) => {
    //         inputFileRef.current.value = "";
    //         setInvoices([]);
    //         setInvoicesWithNewItems([]);
    //         setExistingInvoices([]);
    //         Modal.success({
    //           content: result,
    //         });
    //       });
    //   }
  };

  const updateItemStatus = (invoiceNumber, itemCode) => {
    //   let invoicesWithNewItemsCopy = [...invoicesWithNewItems];
    //   let invoiceIndex = invoicesWithNewItemsCopy.findIndex(
    //     (invoice) => invoice.invoice_number === invoiceNumber
    //   );
    //   let itemIndex = invoicesWithNewItemsCopy[invoiceIndex].items.findIndex(
    //     (item) => item.item_code === itemCode
    //   );
    //   invoicesWithNewItemsCopy[invoiceIndex].items[
    //     itemIndex
    //   ].not_found_in_inventory = false;
    //   setInvoicesWithNewItems(invoicesWithNewItemsCopy);
    //   let notFoundInInventory = invoicesWithNewItemsCopy[invoiceIndex].items.find(
    //     (item) => item.not_found_in_inventory === true
    //   );
    //   console.log(!notFoundInInventory);
    //   if (!notFoundInInventory) {
    //     convertToNormalInvoice(
    //       invoicesWithNewItemsCopy,
    //       invoicesWithNewItemsCopy[invoiceIndex]
    //     );
    //   }
  };

  // // removes the given invoice from invoicesWithNewItemsCopy and appends it to invoices
  const convertToNormalInvoice = async (
    invoicesWithNewItemsCopy,
    newInvoice
  ) => {
    //   let body = {
    //     invoice_number: newInvoice.invoice_number,
    //     items: newInvoice.items,
    //   };
    //   const requestOptions = {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(body),
    //   };
    //   let convertedInvoice = {};
    //   try {
    //     const response = await fetch("api/process_invoice", requestOptions);
    //     const result = await response.json();
    //     if (response.ok) {
    //       convertedInvoice = result;
    //     }
    //   } catch (err) {
    //     console.log(err.message);
    //   }
    //   let invoicesCopy = [...invoices];
    //   let invoiceIndex = invoicesWithNewItemsCopy.findIndex(
    //     (invoice) => invoice.invoice_number === convertedInvoice.invoice_number
    //   );
    //   invoicesWithNewItemsCopy.splice(invoiceIndex, 1);
    //   invoicesCopy.push(convertedInvoice);
    //   setInvoices(invoicesCopy);
    //   setInvoicesWithNewItems(invoicesWithNewItemsCopy);
  };

  console.log("invoices", invoices);
  console.log("invoices with new items", invoicesWithNewItems);
  console.log("existing invoices", existingInvoices);

  return (
    <div className="update-stock">
      <h3>Upload invoices to update stock</h3>
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
      <div className="existing-invoices">
        {existingInvoices.map((invoice) => (
          <h4 key={invoice.invoice_number}>
            Invoice No. {invoice.invoice_number} already exists
          </h4>
        ))}
      </div>

      <div className="invoices-with-new-items">
        {invoicesWithNewItems.map((invoice) => (
          <InvoiceWithNewItems
            key={invoice.invoice_number}
            invoice={invoice}
            updateItemStatus={updateItemStatus}
          ></InvoiceWithNewItems>
        ))}
      </div>

      <div className="invoices">
        {invoices.map((invoice) => (
          <PurchaseInvoice
            key={invoice.invoice_number}
            invoice={invoice}
            dispatchInvoices={dispatchInvoices}
          />
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
