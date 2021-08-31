import { Link } from 'react-router-dom';
import React, {useContext} from 'react';
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
  const [cart, setCart] = tyresContext;
  const [services, setServices] = servicesContext;

  const handlePrint = () =>{
    window.print();
  }

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
          <div className="shop-GSTIN-area">State: Uttar Pradesh, Code-09</div> 
        </div>

        <div style={{clear:"both"}}></div>
       
      
       <hr/>
       <br/>
       <br/>
       <div className="customer-details">
        Bill To: <input type="text" placeholder="customer name"/>
        <br/>
        GSTIN: <input type="text" placeholder="Customer GSTIN"/>
        <br/>
        Vehicle No. : <input type="text" placeholder="AS01BV6235"/>
        <br/>
        Contact: <input type="text" placeholder="Customer phone no."/>
       </div>
       <br/>
       <table>
         <tr>
           <th className="particulars" rowSpan="2">Particulars</th>
           <th className="HSNCode" rowSpan="2">HSN-Code</th>
           <th className="Qty" rowSpan="2">Qty</th>
           <th className="Rate-per-item" rowSpan="2">Rate per Item</th>
           <th className="taxable-value" rowSpan="2">Taxable value</th>
           <th colspan="2" scope="colgroup">CGST</th>
           <th colspan="2" scope="colgroup">SGST</th>
           <th className="value" rowSpan="2">Value</th>
         </tr>
         <tr>
           <th scope="col">Rate</th>
           <th scope="col">Amount</th>
           <th scope="col">Rate</th>
           <th scope="col">Amount</th>
         </tr>
 
         {cart.map( (tyre, index) =>
           <tr key={index}>
             <td>{tyre.desc}</td>
             <td>0000</td>
             <td>{tyre.quantity}</td>
             <td>{roundToTwo(parseFloat(tyre.price)/1.28)}</td>
             <td>{roundToTwo(parseFloat(tyre.price)*parseInt(tyre.quantity)/1.28)}</td>
             <td>14%</td>
             <td>{roundToTwo((0.14*parseFloat(tyre.price)*parseInt(tyre.quantity))/1.28)}</td>
             <td>14%</td>
             <td>{roundToTwo((0.14*parseFloat(tyre.price)*parseInt(tyre.quantity))/1.28)}</td>
             <td>&#x20B9;{parseFloat(tyre.price)*parseInt(tyre.quantity)}</td>
           </tr>
         )}
 
         {services.map( (service, index) => {
           if(service.quantity>0){
             return(<tr key={index}>
               <td>{service.name}</td>
               <td>0000</td>
               <td>{service.quantity}</td>
               <td>{roundToTwo((parseFloat(service.price)/1.18))}</td>
               <td>{roundToTwo(parseFloat(service.price)*parseInt(service.quantity)/1.18)}</td>
               <td>9%</td>
               <td>{roundToTwo((0.09*parseFloat(service.price)*parseInt(service.quantity))/1.18)}</td>
               <td>9%</td>
               <td>{roundToTwo((0.09*parseFloat(service.price)*parseInt(service.quantity))/1.18)}</td>
               <td>&#x20B9;{parseFloat(service.price)*parseInt(service.quantity)}</td>
 
             </tr>);
 
           
           }
           return null;
         }
           
         )}
         
       </table> 
     </div>  
    </div>
   
    
  );
}


export default Invoice;