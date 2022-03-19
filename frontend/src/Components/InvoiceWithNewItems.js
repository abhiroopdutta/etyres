import { useState } from 'react';
import './InvoiceWithNewItems.css';
import AddItem from './AddItem';

function InvoiceWithNewItems ({invoice, invoiceIndex}) {

    const [showModal, setShowModal] = useState(false);
    const [item, setItem] = useState();

    const toggleModal = (state) => {
        setShowModal(state);
    };

    const handleUpdateInventory = item => {
        setItem(item);
        toggleModal(true);
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
            />
            :null}
        </div>
    );
}

export default InvoiceWithNewItems;