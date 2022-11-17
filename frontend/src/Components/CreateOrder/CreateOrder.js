import React, { useState } from "react";
import Cart from "./Cart";
import Products from "./Products";
import "./CreateOrder.css";
import { CartProvider } from "./CartContext"; //understand objects in JS, and deconstructuring

function CreateOrder() {

  return (
    <div className="shop-container">
      <CartProvider>
        <Products className="products" />
        <Cart
          className="cart-container"
        />
      </CartProvider>
    </div>
  );
}

export default CreateOrder;
