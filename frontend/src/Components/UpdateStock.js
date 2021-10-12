import React, {useState, useEffect} from 'react';

function UpdateStock() {

    const [selectedFiles, setSelectedFiles] = useState();
    const [invoices, setInvoices] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [initialSetup, setInitialSetup] = useState(false);
    const [dateUpdateMessage, setDateUpdateMessage] = useState("")

    const handleInitialSetup = () => {
        let invoicesCopy = [...invoices];
        if(!initialSetup){
            for(let i=0; i<invoicesCopy.length; i++){
                invoicesCopy[i].initial_setup = true;
            }
        }
        else {
            for(let i=0; i<invoicesCopy.length; i++){
                invoicesCopy[i].initial_setup = false;
            }
        }
        setInvoices(invoicesCopy);
        setInitialSetup(!initialSetup);
      }

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
			"/api/read_invoice",
			{
				method: 'POST',
				body: formData,
			}
            )
            .then((response) => response.json())
			.then((invoices) => {
                setInvoices(invoices);
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
            setInvoices(invoicesCopy);
        }        
        else{
            invoicesCopy[index].claim_invoice = false;
            invoicesCopy[index].overwrite_price_list = true;
            setInvoices(invoicesCopy);
        }
    }
    console.log(invoices)

    const handleUpdateInventory = ()=>{

        //if price not matching, and user hasn't selected claim or overwrite price, then do not post
        let selectOneError = false;
        let selectDateError = false;
        for(let i=0; i<invoices.length; i++){
            if((!invoices[i].price_list_tally)&&(!invoices[i].claim_invoice)&&(!invoices[i].overwrite_price_list)){
                selectOneError = true;
                console.log("select either claim invoice or overwrite price list");
                break;
            }
        }

        //if initial setup and any invoice date field is empty, then do not post
        for(let i=0; i<invoices.length; i++){
            if(initialSetup && (invoices[i].invoice_date === "")){
                selectDateError = true;
                console.log("please fill the invoice date");
                break;
            }
        }

        if( (!selectOneError) && (!selectDateError) ){
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

    const handleClaimNumber = (index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[index].claim_number = e.target.value;
        setInvoices(invoicesCopy);
        
    }

    const handleInvoiceDate = (index, e) => {
        let invoicesCopy = [...invoices];
        invoicesCopy[index].invoice_date = e.target.value;
        setInvoices(invoicesCopy);
    }

    const handleDateFile = (e) => {
        e.preventDefault();

		fetch("/api/initial_setup")
            .then((response) => response.json())
			.then((message) => {
                setDateUpdateMessage(message);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            
	};



    return (
        <div>
            <button onClick={handleDateFile}>run date update funtion</button>
            <div> {dateUpdateMessage} </div>

            <h3>Upload invoice to update stock</h3>
            <form method="POST" action="" encType="multipart/form-data" >
            <p><input type="file" name="files" multiple onChange={changeHandler}/></p>
            <p><input type="submit" value="Submit"  onClick={handleSubmission}/></p>
            </form>

            {invoices.length!==0?
            <div className="first-date">
                <input type="checkbox" id="initial-setup" name="initial-setup" value="true" onChange={handleInitialSetup}/>
                <label for="initial-setup">Initial Setup</label>
            </div>
            :null}
            {invoices.map( (invoice, index)=>
                <div key={index}>
                    <h4 >Invoice no. {invoice.invoice_number}</h4> 
                    {invoice.already_exists?<div>Invoice already exists in database</div>:null}
                    {initialSetup?<div >Invoice Date: <input type="date" onChange={(e)=>handleInvoiceDate(index, e)}/></div>:null}
                    {invoice.price_list_tally?
                    <div>
                        price is matching   &#9989; 
                    </div>
                    
                    :      
                    <div onChange={(e)=>handleClaimOverwrite(index,e)}>
                        <div>price difference detected   &#10060;</div>
                        <input type="radio" value="claim" name={"claim_overwrite"+index} required/> Mark as claim invoice
                        <input type="radio" value="overwrite" name={"claim_overwrite"+index} required/> Overwrite price list
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
            <br/>
        </div>
        
    );
}

export default UpdateStock;