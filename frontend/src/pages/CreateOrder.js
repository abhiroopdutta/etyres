import React, { useState } from "react";
import Cart from "../Components/CreateOrder/Cart";
import Products from "../Components/CreateOrder/Products";
import "./CreateOrder.css";
import { CartProvider } from "../Components/CreateOrder/CartContext"; //understand objects in JS, and deconstructuring

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
