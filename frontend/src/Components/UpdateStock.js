import React, {useState, useEffect} from 'react';
import './UpdateStock.css';
import PurchaseInvoice from './PurchaseInvoice';
import InvoiceWithNewItems from './InvoiceWithNewItems.js';

function UpdateStock() {

    const [selectedFiles, setSelectedFiles] = useState();
    const [invoices, setInvoices] = useState([]);
    const [invoicesWithNewItems, setInvoicesWithNewItems] = useState([]);
    const [existingInvoices, setExistingInvoices] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

	const changeHandler = (event) => {
		setSelectedFiles(event.target.files);
	};

    const handleSubmission = (e) => {
        e.preventDefault();
		const formData = new FormData();
        for (const file of selectedFiles) {
            formData.append('files[]', file, file.name);
          }

        const requestOptions = {
          method: 'POST',
          body: formData
        };
              
        const submitInvoice = async () => {
            try {
                const response = await fetch("/api/read_invoice", requestOptions);
                const result = await response.json();
                if (response.ok){
                    console.log(result);
                    setInvoices(result.invoices);
                    setExistingInvoices(result.invoices_already_exist);
                    setInvoicesWithNewItems(result.invoices_with_new_products);
                }
            } catch(err){
                console.log(err.message);
            }
        };
        submitInvoice();
	};
    
    const handleInvoiceDate = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].invoice_date = e.target.value;
        setInvoices(invoicesCopy);
    }

    const handleOverwrite = (invoice_index, e) =>{
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].overwrite_price_list = 
        !invoicesCopy[invoice_index].overwrite_price_list;
        setInvoices(invoicesCopy);
    }
    
    const handleClaimOverwrite = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        if(e.target.id === "claim"){
            invoicesCopy[invoice_index].claim_invoice = true;
            invoicesCopy[invoice_index].overwrite_price_list = false;
            invoicesCopy[invoice_index].special_discount = false;
            setInvoices(invoicesCopy);
        }        
        else if(e.target.id === "overwrite"){
            invoicesCopy[invoice_index].claim_invoice = false;
            invoicesCopy[invoice_index].overwrite_price_list = true;
            invoicesCopy[invoice_index].special_discount = false;
            setInvoices(invoicesCopy);
        }
        else if(e.target.id === "special_discount"){
            invoicesCopy[invoice_index].claim_invoice = false;
            invoicesCopy[invoice_index].overwrite_price_list = false;
            invoicesCopy[invoice_index].special_discount = true;
            setInvoices(invoicesCopy);
        }
    }
    console.log(invoices)

    const handleClaimNumber = (invoice_index, claim_item_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].claim_items[claim_item_index].claim_number = e.target.value;
        setInvoices(invoicesCopy);
        
    }

    const handleSpecialDiscount = (invoice_index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[invoice_index].special_discount_type = e.target.value;
        setInvoices(invoicesCopy);
    }

    const handleUpdateStock = ()=>{

        //if price not matching, and user hasn't selected claim or overwrite price, then do not post
        let selectOneError = false;
        let claimNumberError = false;
        let specialDiscountError = false;
        for(let i = 0; i<invoices.length; i++){
            let priceDiff = Math.round(invoices[i].invoice_total) - 
                            Math.round(invoices[i].price_list_total);
            if ((priceDiff<0)&&
                (!invoices[i].claim_invoice)&&
                (!invoices[i].overwrite_price_list)&&
                (!invoices[i].special_discount)){
                selectOneError = true;
                alert(`Invoice number: ${invoices[i].invoice_number}, select either claim invoice or special discount or overwrite price list`);
                break;
            }

            if ((priceDiff)&&(invoices[i].claim_invoice)){
                for(let j = 0; j<invoices[i].claim_items.length; j++){
                    if (invoices[i].claim_items[j].claim_number === "" ||
                        invoices[i].claim_items[j].claim_number === 0){
                        claimNumberError = true;
                        alert(`Invoice number: ${invoices[i].invoice_number}, Please fill claim number`);
                        break;
                    }
                }
            }

            if (priceDiff && invoices[i].special_discount &&
                invoices[i].special_discount_type.trim() === ""){
                    specialDiscountError = true;
                    alert(`Invoice number: ${invoices[i].invoice_number}, Please fill special discount name`);
                    break;
                }
        }


        if( (!selectOneError) && (!claimNumberError) && (!specialDiscountError)){
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoices)
            };
            fetch("/api/update_stock", requestOptions)
                .then(response => response.json())
                .then(result => setSuccessMessage(result));
        }

    }

    return (
        <div className = "update-stock">
            <h3>Upload invoice to update stock</h3>
            <form method = "POST" action = "" encType = "multipart/form-data" >
                <p><input type = "file" name = "files" multiple onChange = {changeHandler}/></p>
                <p><input type = "submit" value = "Submit"  onClick = {handleSubmission}/></p>
            </form>

            <div className = "existing-invoices">
                {existingInvoices.map((invoice, invoiceIndex) => 
                    <h4 key={invoiceIndex}>Invoice No. {invoice.invoice_number} already exists</h4>
                )}
            </div>

            <div className = "invoices-with-new-items">
                {invoicesWithNewItems.map((invoice, invoiceIndex) => 
                    <InvoiceWithNewItems 
                        invoice = {invoice}
                        key = {invoiceIndex}>
                    </InvoiceWithNewItems>
                )}
            </div>

            <div className = "invoices">
                {invoices.map( (invoice, invoice_index)=> 
                <PurchaseInvoice 
                    invoice = {invoice} 
                    key = {invoice_index}
                    invoice_index = {invoice_index}
                    handleInvoiceDate = {handleInvoiceDate}
                    handleClaimOverwrite = {handleClaimOverwrite}
                    handleOverwrite = {handleOverwrite}
                    handleClaimNumber = {handleClaimNumber}
                    handleSpecialDiscount = {handleSpecialDiscount}
                />
                )}
            </div>

            {((invoices.length!==0) && (invoicesWithNewItems.length === 0))?
                <button className = "update-inventory" onClick = {handleUpdateStock}>
                    Update inventory and save invoices
                </button>
            :null}
            <br/>

            {successMessage!==""?<h4>{successMessage} !</h4>:null}
            <br/>
        </div>
        
    );
}

export default UpdateStock;