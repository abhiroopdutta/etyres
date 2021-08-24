import { Link } from 'react-router-dom';
import React, {useContext} from 'react';
import { CartContext } from './CartContext';



function Invoice() {

  const {tyresContext, servicesContext} = useContext(CartContext);
  const [cart, setCart] = tyresContext;
  const [services, setServices] = servicesContext;

  return (
    <div>
      <h1>Invoice hello</h1>
      <Link to="/create_order">Go back to shop</Link> 
    </div>
    
  );
}


export default Invoice;