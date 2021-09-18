import React, {useState} from 'react';

function UpdateStock() {

    const [selectedFiles, setSelectedFiles] = useState();
    const [invoices, setinvoices] = useState([]);

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
			'/update_stock',
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
        e.preventDefault();
        let invoicesCopy = [...invoices];
        if(e.target.value === "claim"){
            invoicesCopy[index].claim_invoice = "True";
            invoicesCopy[index].overwrite_price_list = "False";
            setinvoices(invoicesCopy);
        }        
        else{
            invoicesCopy[index].claim_invoice = "False";
            invoicesCopy[index].overwrite_price_list = "True";
            setinvoices(invoicesCopy);
        }
        console.log(invoices[index])
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
                    {invoice.price_list_tally?
                    <div>
                        price is matching   &#9989; 
                    </div>
                    
                    :        
                    <div onChange={(e)=>handleClaimOverwrite(index,e)}>
                        <p>price difference detected   &#10060;</p>
                        <input type="radio" value="claim" name="claim_overwrite" /> Mark as claim invoice
                        <input type="radio" value="overwrite" name="claim_overwrite" /> Overwrite price list
                    </div>   
                    }
                    <br/>
                    <hr/>
                                                    
                </div>
                )}

                {invoices.length!==0?<button>Update inventory and save invoices</button>:null}
                
        </div>
        
    );
}

export default UpdateStock;