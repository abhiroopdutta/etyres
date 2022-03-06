import React, { useEffect, useState } from 'react';
import './PurchaseInvoice.css';

function PurchaseInvoice({invoice, invoice_index, handleInvoiceDate, handleClaimOverwrite, handleOverwrite, handleClaimNumber, handleSpecialDiscount}){

    const [priceDifference, setPriceDifference] = useState(0);

    useEffect(
        ()=>{
            let priceDiff = Math.round(invoice.invoice_total) - Math.round(invoice.price_list_total);
            setPriceDifference(priceDiff);
        },
    []);

    let price_match_component;
    if (priceDifference > 0){
        price_match_component =                 
            <div>
                Invoice Total is <strong>greater</strong> by  &#8377; {Math.abs(priceDifference)}   &#10060;
            </div>

    }
    else if (priceDifference < 0){
        price_match_component =                 
            <div>
                Invoice Total is <strong>lesser</strong> by  &#8377; {Math.abs(priceDifference)}   &#10060;
            </div>  
    }
    else if (priceDifference === 0){
        price_match_component = <div>Price match  &#9989; </div>
    }

    return(
        <div className="purchase-invoice">
            <header>
                <strong className="invoice-number">Invoice no. {invoice.invoice_number}</strong> 
                {<strong className="invoice-date">Invoice Date: <input type="date" value={invoice.invoice_date} required="required" onChange={(e)=>handleInvoiceDate(invoice_index, e)}/></strong>}
                <br/>
                <br/>
            </header>
            <hr/>
            
            {invoice.already_exists?<p className="invoice-exists">Invoice already exists in database &#8252;</p>:null}
            {(priceDifference&&invoice.special_discount)?
            <div className="special-discount">Discount Type:
                <input type="text" value={invoice.special_discount_type} onChange={(e)=>handleSpecialDiscount(invoice_index, e)} placeholder="ex - LVD" /> 
            </div>
            :null
            }
            {(priceDifference > 0)?     
            <section className="claim-overwrite" onChange={(e)=>handleOverwrite(invoice_index,e)}>
                <input type="checkbox" value="overwrite" name={"claim_overwrite"+invoice_index}/>
                <label htmlFor={"claim_overwrite"+invoice_index}> Overwrite price list</label> 
            </section>   
            :(priceDifference < 0)?
            <section className="claim-overwrite" onChange={(e)=>handleClaimOverwrite(invoice_index,e)}>
                <input type="radio" id="claim" name={"claim_overwrite"+invoice_index} value={invoice.claim_invoice} required/> 
                <label htmlFor={"claim"}> Claim Invoice</label>
                <input type="radio" id="overwrite" name={"claim_overwrite"+invoice_index} value={invoice.overwrite_price_list} required/> 
                <label htmlFor={"overwrite"}>Overwrite Price List</label>
                <input type="radio" id="special_discount" name={"claim_overwrite"+invoice_index} value={invoice.special_discount} required/>
                <label htmlFor={"special_discount"}>Special Discount</label>
            </section>
            :null              
            }

            <table className="invoice-item-headers">
                <tr>
                    <th>S.no.</th>
                    <th>Item Desc</th>
                    <th>Qty</th>
                    <th>Price</th>
                    {invoice.claim_invoice?
                    <th>Claim No.</th>:null}
                </tr>
                
                {invoice.claim_invoice?
                invoice.claim_items.map( (service, claim_item_index)=>
                <tr key={claim_item_index}>
                    <td>{claim_item_index+1}</td>
                    <td>{service.item_desc}:</td> 
                    <td>{service.quantity}</td>
                    <td>{service.item_total}</td>
                    <td><input type="text" placeholder="claim number" onChange={e=>handleClaimNumber(invoice_index, claim_item_index, e)}/></td>
                </tr>)
                :invoice.items.map( (service, item_index)=>
                <tr key={item_index}>
                    <td>{item_index+1}</td>
                    <td>{service.item_desc}:</td> 
                    <td>{service.quantity}</td>
                    <td>{service.item_total}</td>
                </tr>)}

                <tr>
                    <th colSpan="3">Total</th>
                    <th>{invoice.invoice_total}</th>
                    {invoice.claim_invoice?
                    <th></th>:null}
                </tr>
 
            </table>

            <section className="invoice-price-difference">
                {price_match_component}
            </section>

            <br/>                           
        </div>
    )
}

export default PurchaseInvoice;