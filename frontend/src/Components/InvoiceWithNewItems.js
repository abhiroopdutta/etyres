import { useState } from 'react';
import './InvoiceWithNewItems.css';
import AddItem from './AddItem';

function InvoiceWithNewItems ({initial_invoice, invoiceIndex, convertToNormalInvoice}) {

    const [showModal, setShowModal] = useState(false);
    const [item, setItem] = useState();
    const [invoice, setInvoice] = useState(initial_invoice);
    const [newInvoice, setNewInvoice] = useState();

    const toggleModal = (state) => {
        setShowModal(state);
    };

    const handleUpdateInventory = item => {
        setItem(item);
        toggleModal(true);
    };

    const updateItemStatus = (new_item) => {
        let invoiceCopy = invoice;
        let itemIndex = invoiceCopy.items.findIndex(item => 
            item.item_code === new_item.item_code);
        invoiceCopy.items[itemIndex].not_found_in_inventory = false;
        setInvoice(invoiceCopy);
    }

    // checks if user has added all new items to inventory
    const updateInvoiceStatus = () => {

        // Put it in parent component (Update stock)
        // let new_invoice = {
        //     invoice_number: invoice.invoice_number,
        //     items: invoice.items
        // };
        // const requestOptions = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(new_invoice)
        // };

        // const submit_invoice = async () => {
        //     try{
        //         const response = await fetch("api/process_invoice", requestOptions);
        //         const result = await response.json();
        //         if(response.ok){
        //             setNewInvoice(result);
        //             console.log("invoice converted");
        //         }
        //     } catch(err){
        //         console.log(err.message);
        //     }
        // }

        let notFoundInInventory = invoice.items.find(item => item.not_found_in_inventory === true);

        if (!notFoundInInventory){
            console.log("all items added to inventory!");
            console.log(newInvoice);
            convertToNormalInvoice(newInvoice);
        }
    };

    return (
        <div className="invoice-with-new-items">
            <header>
                <strong className="invoice-number">Invoice no. {invoice.invoice_number}</strong> 
            </header>
            <hr/>
            <table className="invoice-item-headers">
                <tr>
                    <th>S.no.</th>
                    <th>Item Desc</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>inventory</th>
                </tr>
                
                {invoice.items.map( (item, index)=>
                <tr key={index}>
                    <td>{index+1}</td>
                    <td>{item.item_desc}:</td> 
                    <td>{item.quantity}</td>
                    <td>{item.item_total}</td>
                    <td>{item.not_found_in_inventory?
                        <button onClick = {()=>handleUpdateInventory(item)}>Add to inventory</button>
                        : <div>&#9989;</div>}
                    </td>
                </tr>)}
            </table>

            {showModal?
            <AddItem
                item = {item}
                toggleModal = {toggleModal}
                updateItemStatus = {updateItemStatus}
                updateInvoiceStatus = {updateInvoiceStatus}
            />
            :null}
        </div>
    );
}

export default InvoiceWithNewItems;