import React from 'react';
import Cart from './Cart';
import Products from './Products';
import './Shop.css';

function Shop() {
  return (
      <div className="shop-container">
        <Products className="products"/>
        <Cart className="cart-container"/>
      </div>     
  );
}


export default Shop;
