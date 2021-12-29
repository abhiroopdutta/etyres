import React from 'react';
import './PurchaseInvoice.css';

function PurchaseInvoice({invoice, invoice_index, handleInvoiceDate, handleClaimOverwrite, handleClaimNumber, handleSpecialDiscount}){

    return(
        <div className="purchase-invoice">
            <header>
                <strong className="invoice-number">Invoice no. {invoice.invoice_number}</strong> 
                {<strong className="invoice-date">Invoice Date: <input type="date" value={invoice.invoice_date} required="required" onChange={(e)=>handleInvoiceDate(invoice_index, e)}/></strong>}
            </header>
            <hr/>
            
            {invoice.already_exists?<p className="invoice-exists">Invoice already exists in database &#8252;</p>:null}
            {(invoice.price_difference&&invoice.special_discount)?
            <div className="special-discount">Discount Type:
                <input type="text" value={invoice.special_discount} onChange={(e)=>handleSpecialDiscount(invoice_index, e)} /> 
            </div>
            :null
            }
            {invoice.price_difference?     
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
                {invoice.price_difference?    
                <div>Price difference of &#8377; {invoice.price_difference} detected   &#10060;</div>            
                :<div>Price match  &#9989; </div>}
            </section>

            <br/>                           
        </div>
    )
}

export default PurchaseInvoice;