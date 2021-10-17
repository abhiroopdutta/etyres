import React from 'react';
import Cart from './Cart';
import Products from './Products';
import './Shop.css';

function Shop() {
  return (
      <div className="shop-container">
        <div className="products"><Products/></div>
        <div className="cart"><Cart/></div>
      </div>     
  );
}


export default Shop;
