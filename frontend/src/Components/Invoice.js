import { Link } from 'react-router-dom';
import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';
import './Invoice.css';

//to-do: date should update real time by chance invoice creation takes place near midnight
function getCurrentDate(separator=''){

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  
  return `${date}${separator}${month<10?`0${month}`:`${month}`}${separator}${year}`;
  };

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}


function Invoice() {

  const {tyresContext, servicesContext} = useContext(CartContext);
  // eslint-disable-next-line
  const [cart, setCart] = tyresContext;
  // eslint-disable-next-line
  const [services, setServices] = servicesContext;

  const [purchasedProducts, setPurchasedProducts] = useState(cart.map((product)=>{
    return {
      type:"product",
      id:product.id,
      HSN:product.HSN,
      desc:product.desc,
      CP:parseFloat(product.CP),
      price:parseFloat(product.price),
      quantity:parseInt(product.quantity),
      CGST:0.14,
      SGST:0.14,
      IGST:0
    };
  }));


  //render different tables depending on IGST customer or not
  const [IGSTRender, SetIGSTRender] = useState(false);

  
  const handlePrint = () =>{
    window.print();
  }

  //if customer GSTIN doesn't start with 09, then IGST
  const handleIGST = (e) =>{
    let purchasedProductsCopy = [...purchasedProducts];

    if(e.target.value==="0"||e.target.value.startsWith("09")||!e.target.value){
      for(let i=0; i<purchasedProductsCopy.length; i++){    
        purchasedProductsCopy[i].IGST = 0;
        purchasedProductsCopy[i].CGST = parseFloat(0.14);
        purchasedProductsCopy[i].SGST = parseFloat(0.14);
      }
      SetIGSTRender(false);
    }

    else{
      for(let i=0; i<purchasedProductsCopy.length; i++){    
        purchasedProductsCopy[i].IGST = parseFloat(0.28);
        purchasedProductsCopy[i].CGST = parseFloat(0);
        purchasedProductsCopy[i].SGST = parseFloat(0);
      }
      SetIGSTRender(true);
    }
 
    //comment the below line and state is still updated IGST value, how???!!
    setPurchasedProducts(purchasedProductsCopy);
  }


  //calculate total for products (tyres, tubes)
  let totalProductQuantity = 0;
  let totalProductTaxableValue = 0;
  let totalProductCGST = 0;
  let totalProductSGST = 0;
  let totalProductIGST = 0;
  let totalProductValue = 0;
  for(let i=0; i<purchasedProducts.length; i++){
    totalProductQuantity+= purchasedProducts[i].quantity;
    if(IGSTRender){
      totalProductTaxableValue += roundToTwo(parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity)/(1.0+(purchasedProducts[i].IGST)));
    }
    else{
      totalProductTaxableValue +=roundToTwo(parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity)/1.28);
    }
    totalProductIGST += roundToTwo(((purchasedProducts[i].IGST)*parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity))/(1.0+(purchasedProducts[i].IGST)));
    totalProductCGST += roundToTwo((purchasedProducts[i].CGST*parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity))/1.28);
    totalProductSGST += roundToTwo((purchasedProducts[i].SGST*parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity))/1.28);
    totalProductValue += parseFloat(purchasedProducts[i].price)*parseInt(purchasedProducts[i].quantity);
  }

  //calculate total for services
  let totalServiceQuantity = 0;
  let totalServiceTaxableValue = 0;
  let totalServiceCGST = 0;
  let totalServiceSGST = 0;
  let totalServiceValue = 0;
  for(let i=0; i<services.length; i++){
    totalServiceQuantity += parseInt(services[i].quantity);
    totalServiceTaxableValue += (parseFloat(services[i].price)*parseInt(services[i].quantity)/1.18);
    totalServiceCGST += (0.09*parseFloat(services[i].price)*parseInt(services[i].quantity))/1.18;
    totalServiceSGST+= (0.09*parseFloat(services[i].price)*parseInt(services[i].quantity))/1.18;
    totalServiceValue += parseFloat(services[i].price)*parseInt(services[i].quantity);
  }

  //calculate absolute total(will be used only for GST since IGST will have total only for tyres)
  let totalQuantity = totalProductQuantity + totalServiceQuantity;
  let totalTaxableValue = totalProductTaxableValue + totalServiceTaxableValue;
  let totalCGST = totalProductCGST + totalServiceCGST;
  let totalSGST = totalProductSGST + totalServiceSGST;
  let totalValue = totalProductValue + totalServiceValue;


  //write a function to query the database for invoice number

  return (
    <div className="invoice-component">
      <button className="print-button" onClick={handlePrint}>PRINT</button>
      <Link className = "back-to-shop" to="/create_order">Go back to shop</Link>
      <div className="invoice-body">          
        <div className="invoice-details">
          <div className="shop-name">EUREKA TYRES</div>
          <div className="invoice-no">Invoice #: 002</div>
          <br/>
          <div className="shop-description">APOLLO PV ZONE</div>
          <div className="invoice-date">Invoice Date: {getCurrentDate("/")}</div>
          <br/>
          <div className="shop-address-1">52/42/6A, Tashkand Marg, Civil Lines, Allahabad</div>
          <div className="shop-GSTIN">GSTIN: 09FWTPD4101B1ZT</div>
          <div className="shop-address-2">Uttar Pradesh - 211001 | +91 94355 55596</div>          
          <div className="shop-GSTIN-area">State: Uttar Pradesh, Code:09</div> 
        </div>
        {/*this below div only required for css float left and right for above lines*/}
        <div style={{clear:"both"}}></div>      
        <hr/>
        <br/>
        <br/>
        <div className="customer-details">Bill To: <input type="text" placeholder="customer name"/>
          <br/>
          Address: <input type="text" placeholder="customer address"/>
          <br/>
          GSTIN: <input type="text" maxlength="15" onChange={handleIGST} placeholder="customer GSTIN"/>
          <br/>
          Code: <input type="text" maxlength="2"/>
          State: <input type="text" placeholder="state"/>
          <br/>
          Vehicle No. : <input type="text" placeholder="AS01BV6235"/>
          <br/>
          Contact: <input type="text" placeholder="customer phone no."/>
        </div>
        <br/>

        {IGSTRender?
          <table className="IGST-table">
            <tr>
              <th className="particulars" rowSpan="2">Particulars</th>
              <th className="HSNCode" rowSpan="2">HSN-Code</th>
              <th className="Qty" rowSpan="2">Qty</th>
              <th className="Rate-per-item" rowSpan="2">Rate per Item</th>
              <th className="taxable-value" rowSpan="2">Taxable value</th>
              <th colSpan="2" scope="colgroup">IGST</th>
              <th className="value" rowSpan="2">Value</th>
            </tr>
            <tr>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
            </tr>

            {purchasedProducts.map( (tyre, index) =>
            <tr key={index}>
              <td>{tyre.desc}</td>
              <td>{tyre.HSN}</td>
              <td>{tyre.quantity}</td>
              <td>{roundToTwo(parseFloat(tyre.price)/(1.0+(tyre.IGST)))}</td>
              <td>{roundToTwo(parseFloat(tyre.price)*parseInt(tyre.quantity)/(1.0+(tyre.IGST)))}</td>
              <td className="IGST-cell">{roundToTwo(tyre.IGST)}%</td>
              <td> {roundToTwo(((tyre.IGST)*parseFloat(tyre.price)*parseInt(tyre.quantity))/(1.0+(tyre.IGST)))} </td>
              <td>{parseFloat(tyre.price)*parseInt(tyre.quantity)}</td>
            </tr>
            )}

            <tr>
              <th>Total</th>
              <td>-</td>
              <td>{totalProductQuantity}</td>
              <td>-</td>
              <td>{totalProductTaxableValue}</td>
              <td>-</td>
              <td>{totalProductIGST}</td>
              <td>{totalProductValue}</td>
            </tr>

          </table>
     
          :
          <table className="GST-table">
            <tr>
              <th className="particulars" rowSpan="2">Particulars</th>
              <th className="HSNCode" rowSpan="2">HSN-Code</th>
              <th className="Qty" rowSpan="2">Qty</th>
              <th className="Rate-per-item" rowSpan="2">Rate per Item</th>
              <th className="taxable-value" rowSpan="2">Taxable value</th>
              <th colSpan="2" scope="colgroup">CGST</th>
              <th colSpan="2" scope="colgroup">SGST</th>
              <th className="value" rowSpan="2">Value</th>
            </tr>
            <tr>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
              <th scope="col">Rate</th>
              <th scope="col">Amt</th>
            </tr>

            {purchasedProducts.map( (tyre, index) =>
            <tr key={index}>
              <td>{tyre.desc}</td>
              <td>{tyre.HSN}</td>
              <td>{tyre.quantity}</td>
              <td>{roundToTwo(parseFloat(tyre.price)/1.28)}</td>
              <td>{roundToTwo(parseFloat(tyre.price)*parseInt(tyre.quantity)/1.28)}</td>
              <td>{roundToTwo(tyre.CGST*100)}%</td>
              <td>{roundToTwo((tyre.CGST*parseFloat(tyre.price)*parseInt(tyre.quantity))/1.28)}</td>
              <td>{roundToTwo(tyre.SGST*100)}%</td>
              <td>{roundToTwo((tyre.SGST*parseFloat(tyre.price)*parseInt(tyre.quantity))/1.28)}</td>
              <td>{parseFloat(tyre.price)*parseInt(tyre.quantity)}</td>
            </tr>
            )}
        
            {services.map( (service, index) => {if(service.quantity>0){return(
            <tr key={index}>
              <td>{service.name}</td>
              <td>0000</td>
              <td>{service.quantity}</td>
              <td>{roundToTwo((parseFloat(service.price)/1.18))}</td>
              <td>{roundToTwo(parseFloat(service.price)*parseInt(service.quantity)/1.18)}</td>
              <td>9%</td>
              <td>{roundToTwo((0.09*parseFloat(service.price)*parseInt(service.quantity))/1.18)}</td>
              <td>9%</td>
              <td>{roundToTwo((0.09*parseFloat(service.price)*parseInt(service.quantity))/1.18)}</td>
              <td>{parseFloat(service.price)*parseInt(service.quantity)}</td>
            </tr>
              );}
              return null;
              }          
            )}

            <tr>
              <th>Total</th>
              <td>-</td>
              <td>{roundToTwo(totalQuantity)}</td>
              <td>-</td>
              <td>{roundToTwo(totalTaxableValue)}</td>
              <td>-</td>
              <td>{roundToTwo(totalCGST)}</td>
              <td>-</td>
              <td>{roundToTwo(totalSGST)}</td>
              <td>{roundToTwo(totalValue)}</td>
            </tr>

          </table>

        }
        <br/>
        <br/>
        <br/>
        <div className="bank-name">Bank of Maharashtra A/c No. 60386889626</div>
        <div className="signatory-name">For EUREKA TYRES</div>
        <br/>
        <div className="bank-details">RTGS-NEFT-IFSC Code - MAHB0001291</div>
        <div className="signature"></div>
        <br/>
        <br/>
        <div className="eoe">E. &#38; O. E.</div>
        <div className="signatory">Authorised Signatory</div>
        <div style={{clear:"both"}}></div> 

      </div>  
    </div>
       
  );
}


export default Invoice;