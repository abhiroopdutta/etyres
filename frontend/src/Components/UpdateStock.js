import React, {useState, useEffect} from 'react';

function UpdateStock() {

    const [selectedFiles, setSelectedFiles] = useState();
    const [invoices, setinvoices] = useState([]);
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
        

		fetch(
			"/read_invoice",
			{
				method: 'POST',
				body: formData,
			}
            )
            .then((response) => response.json())
			.then((invoices) => {
                setinvoices(invoices);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            
	};

    const handleClaimOverwrite = (index, e) => {
        let invoicesCopy = [...invoices];
        if(e.target.value === "claim"){
            invoicesCopy[index].claim_invoice = true;
            invoicesCopy[index].overwrite_price_list = false;
            setinvoices(invoicesCopy);
        }        
        else{
            invoicesCopy[index].claim_invoice = false;
            invoicesCopy[index].overwrite_price_list = true;
            setinvoices(invoicesCopy);
        }
    }
    

    const handleUpdateInventory = ()=>{
        let selectOneError = false;
        for(let i=0; i<invoices.length; i++){
            if((!invoices[i].price_list_tally)&&(!invoices[i].claim_invoice)&&(!invoices[i].overwrite_price_list)){
                selectOneError = true;
                break;
            }
        }

        if(!selectOneError){
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoices)
            };
            fetch("/update_stock", requestOptions)
                .then(response => response.json())
                .then(result => setSuccessMessage(result));
        }

    }

    const handleClaimNumber = (index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[index].claim_number = e.target.value;
        setinvoices(invoicesCopy);
        
    }
    return (
        <div>
            <h3>Upload invoice to update stock</h3>
            <form method="POST" action="" encType="multipart/form-data" >
            <p><input type="file" name="files" multiple onChange={changeHandler}/></p>
            <p><input type="submit" value="Submit"  onClick={handleSubmission}/></p>
            </form>

            {invoices.map( (invoice, index)=>
                <div key={index}>
                    <h4 className="invoice-number">Invoice no. {invoice.invoice_number}</h4> 
                    {invoice.already_exists?<div>Invoice already exists in database</div>:null}
                    {invoice.price_list_tally?
                    <div>
                        price is matching   &#9989; 
                    </div>
                    
                    :        
                    <div onChange={(e)=>handleClaimOverwrite(index,e)}>
                        <div>price difference detected   &#10060;</div>
                        <input type="radio" value="claim" name="claim_overwrite" required/> Mark as claim invoice
                        <input type="radio" value="overwrite" name="claim_overwrite" required/> Overwrite price list
                    </div>   
                    }
                    <br/>
                    {invoice.claim_invoice?
                    <input type="text" placeholder="claim number" onChange={(e)=>handleClaimNumber(index,e)}/>:null}
                    <br/>
                    <hr/>
                                                    
                </div>
                )}
                {invoices.length!==0?<button onClick={handleUpdateInventory}>Update inventory and save invoices</button>:null}
                <br/>
                {successMessage!==""?<h4>{successMessage} !</h4>:null}
        </div>
        
    );
}

export default UpdateStock;