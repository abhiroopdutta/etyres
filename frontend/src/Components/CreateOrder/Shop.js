import React, { useState } from "react";
import Cart from "./Cart";
import Products from "./Products";
import "./Shop.css";

function Shop() {
  const [refreshProducts, setRefreshProducts] = useState(false);
  const handleRefreshProducts = () => {
    setRefreshProducts(!refreshProducts);
  };

  return (
    <div className="shop-container">
      <Products refreshProducts={refreshProducts} className="products" />
      <Cart
        handleRefreshProducts={handleRefreshProducts}
        className="cart-container"
      />
    </div>
  );
}

export default Shop;
