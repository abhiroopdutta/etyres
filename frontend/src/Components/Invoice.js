import { Link } from 'react-router-dom';
import React, {useContext} from 'react';
import { CartContext } from './CartContext';
import './Invoice.css';

//to-do: date should update by chance invoice creation takes place near midnight
function getCurrentDate(separator=''){

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  
  return `${date}${separator}${month<10?`0${month}`:`${month}`}${separator}${year}`;
  };

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
      Name: <input type="text" placeholder="Customer Name"/>
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
          <th>Rate</th>
          <th>Amount</th>
        </tr>

        {cart.map( (tyre, index) =>
          <tr key={index}>
            <td>{tyre.desc}</td>
            <td>{index}</td>
            <td>{tyre.quantity}</td>
            <td>&#x20B9;{tyre.price}</td>
            <td>&#x20B9;{parseFloat(tyre.price)*parseInt(tyre.quantity)}</td>
          </tr>
        )}

        {services.map( (service, index) => {
          if(service.quantity>0){
            return(<tr key={index}>
              <td>{service.name}</td>
              <td>-</td>
              <td>{service.quantity}</td>
              <td>&#x20B9;{service.price}</td>
              <td>&#x20B9;{parseFloat(service.price)*parseInt(service.quantity)}</td>
            </tr>);
          }
        }
          
        )}
        
      </table>

      {/* {cart.map( (tyre, index)=> <div key={index}> desc:{tyre.desc} price:{tyre.price} quantity:{tyre.quantity} </div> )}  */}
      <hr/>
      <Link to="/create_order">Go back to shop</Link> 
    </div>
    
  );
}


export default Invoice;