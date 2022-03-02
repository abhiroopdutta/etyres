import React, { useEffect, useState } from 'react';
import './PurchaseInvoice.css';

function PurchaseInvoice({invoice, invoice_index, handleInvoiceDate, handleClaimOverwrite, handleClaimNumber, handleSpecialDiscount}){

    const [priceDifference, setPriceDifference] = useState(0);

    useEffect(
        ()=>{
            let priceDiff = Math.round(invoice.invoice_total) - Math.round(invoice.price_list_total);
            setPriceDifference(priceDiff);
        },
    []);

    console.log(priceDifference);
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
    else if (priceDifference == 0){
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
                <input type="text" value={invoice.special_discount} onChange={(e)=>handleSpecialDiscount(invoice_index, e)} /> 
            </div>
            :null
            }
            {priceDifference?     
            <section className="claim-overwrite" onChange={(e)=>handleClaimOverwrite(invoice_index,e)}>
                <input type="radio" value="claim" name={"claim_overwrite"+invoice_index} required/> Claim Invoice
                <input type="radio" value="overwrite" name={"claim_overwrite"+invoice_index} required/> Overwrite price list
                <input type="radio" value="special_discount" name={"claim_overwrite"+invoice_index} required/> Special Discount
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