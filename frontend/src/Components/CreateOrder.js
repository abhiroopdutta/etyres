import React from 'react';
import Shop from './Shop';
import { CartProvider } from './CartContext'; //understand objects in JS, and deconstructuring
import Invoice from './Invoice';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function CreateOrder() {
  return (
    <Router>
      <CartProvider>
        <Switch>
          <Route path="/shop"> <Shop/> </Route>   
          <Route path="/invoice"> <Invoice/> </Route>
          <Shop/>
        </Switch>        
      </CartProvider>      
    </Router>           
  );
}


export default CreateOrder;