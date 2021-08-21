import React from 'react';
import Cart from './Cart';
import Products from './Products';
import { CartProvider } from './CartContext'; //understand objects in JS, and deconstructuring

function Shop() {
  return (

    <CartProvider>
      <div className="Shop">
        <Cart/>
        <Products/>
      </div>   
    </CartProvider>   
  );
}


export default Shop;
