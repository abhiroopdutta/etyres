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

  //write a function to query the database for invoice number

  return (
    <div>
      <div className="date">Invoice Date: {getCurrentDate("/")}</div>
      <div className="invoice_no">Invoice #: 002</div>
      <div className="our_GSTIN">
      GSTIN: 09FWTPD4101B1ZT 
      <br/>
      State: Uttar Pradesh, Code-09
      </div>
      <br/>
      <div className="our_name">EUREKA TYRES</div>
      <div className="our_description">APOLLO PV ZONE</div>
      <div className="our_address">
      52/42/6A, Tashkand Marg, Civil Lines, Allahabad 
      <br/>
      Uttar Pradesh - 211001 | +91 94355 55596
      </div>
      <br/>
      <div className="customer_details">
      Bill To: <br/>
      <input type="text" placeholder="Customer Name"/>
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
          <th>Particulars</th>
          <th>HSN-Code</th>
          <th>Quantity</th>
          <th>Rate per Item</th>
          <th>Taxable value</th>
          <th colspan="2" scope="colgroup">CGST</th>
          <th colspan="2" scope="colgroup">SGST</th>
          <th>Value</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th scope="col">Rate</th>
          <th scope="col">Amount</th>
          <th scope="col">Rate</th>
          <th scope="col">Amount</th>
          <th></th>
        </tr>


        {cart.map( (tyre, index) =>
          <tr key={index}>
            <td>{tyre.desc}</td>
            <td>HSN-Code not yet available</td>
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
              <td>HSN-Code not yet available</td>
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
      <hr/>
      <Link to="/create_order">Go back to shop</Link> 
    </div>
    
  );
}


export default Invoice;