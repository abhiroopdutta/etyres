import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "./CartTyre.css";

//object deconstruction in props
function CartTyre({ tyreData }) {
  const { tyresContext, servicesContext } = useContext(CartContext);
  const [cart, setCart] = tyresContext;

  const removeFromCart = (tyreData) => {
    setCart((cart) =>
      cart.filter((product) => product.itemCode !== tyreData.itemCode)
    );
  };

  const handlePrice = (e) => {
    e.preventDefault(); //why use this
    setCart((cart) =>
      cart.map((product) => {
        if (product.itemCode === tyreData.itemCode) {
          const updatedProduct = {
            ...product,
            price: parseFloat(e.target.value),
          };
          return updatedProduct;
        }
        return product;
      })
    );
  };

  const handleFocus = (e) => e.target.select();

  const handleQuantity = (e) => {
    e.preventDefault(); //why use this
    setCart((cart) =>
      cart.map((product) => {
        if (product.itemCode === tyreData.itemCode) {
          const updatedProduct = {
            ...product,
            quantity: parseInt(e.target.value),
          };
          return updatedProduct;
        }
        return product;
      })
    );
  };

  return (
    <div className="cart-tyre">
      <div className="cart-tyre-name">{tyreData.itemDesc}</div>
      <div className="cart-tyre-details">
        <div className="cart-tyre-CP">CP: {tyreData.costPrice}</div>
        <div className="cart-tyre-price">
          <label htmlFor="price">Price: </label>
          <input
            id="price"
            type="text"
            value={tyreData.price}
            onChange={handlePrice}
            onFocus={handleFocus}
          />
        </div>
        <div className="cart-tyre-quantity">
          <label htmlFor="quantity">Qty: </label>
          <input
            id="quantity"
            type="number"
            step="1"
            min="1"
            value={tyreData.quantity}
            onChange={handleQuantity}
            onFocus={handleFocus}
          />
        </div>
        <div>
          <button
            className="cart-tyre-button"
            onClick={() => removeFromCart(tyreData)}
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartTyre;
