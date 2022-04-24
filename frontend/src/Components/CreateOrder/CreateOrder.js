import React, { useState } from "react";
import Cart from "./Cart";
import Products from "./Products";
import "./Shop.css";
import { CartProvider } from "./CartContext"; //understand objects in JS, and deconstructuring

function CreateOrder() {
  const [refreshProducts, setRefreshProducts] = useState(false);
  const handleRefreshProducts = () => {
    setRefreshProducts(!refreshProducts);
  };

  return (
    <div className="shop-container">
      <CartProvider>
        <Products refreshProducts={refreshProducts} className="products" />
        <Cart
          handleRefreshProducts={handleRefreshProducts}
          className="cart-container"
        />
      </CartProvider>
    </div>
  );
}

export default CreateOrder;
