import React from 'react';
import Shop from './Shop';
import { CartProvider } from './CartContext'; //understand objects in JS, and deconstructuring
import Invoice from './Invoice';
import InvoicePdf from './InvoicePdf';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';

function CreateOrder() {
  return (
    <Router>
      <CartProvider>
        <Switch>
          <Route path="/shop"> <Shop/> </Route>   
          
            {/* <Route path="/invoice"> <PDFViewer width="1000" height="600"><InvoicePdf/></PDFViewer>  </Route> */}
            <Route path="/invoice"> <Invoice/> </Route>

          <Shop/>
        </Switch>        
      </CartProvider>      
    </Router>           
  );
}


export default CreateOrder;