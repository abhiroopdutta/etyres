import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "./CartTyre.css";

//object deconstruction in props
function CartTyre({ tyreData }) {
  const { tyresContext } = useContext(CartContext);
  const [cart, setCart] = tyresContext;

  const removeFromCart = (tyreData) => {
    setCart((cart) =>
      cart.filter((product) => product.itemCode !== tyreData.itemCode)
    );
  };

  const handlePrice = (e) => {
    e.preventDefault(); //why use this
    let price;
    if (e.target.value === "") {
      price = 0;
    } else {
      price = parseFloat(e.target.value);
    }
    setCart((cart) =>
      cart.map((product) => {
        if (product.itemCode === tyreData.itemCode) {
          const updatedProduct = {
            ...product,
            price: price,
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
    let quantity;
    if (e.target.value === "") {
      quantity = 0;
    } else {
      quantity = parseInt(e.target.value);
    }
    setCart((cart) =>
      cart.map((product) => {
        if (product.itemCode === tyreData.itemCode) {
          const updatedProduct = {
            ...product,
            quantity: quantity,
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
            className="cart-tyre-price-input"
            type="number"
            min="1"
            value={tyreData.price}
            onChange={handlePrice}
            onFocus={handleFocus}
            onWheel={(e) => e.target.blur()}
          />
        </div>
        <div className="cart-tyre-quantity">
          <label htmlFor="quantity">Qty: </label>
          <input
            className="cart-tyre-quantity-input"
            type="number"
            step="1"
            min="1"
            value={tyreData.quantity}
            onChange={handleQuantity}
            onFocus={handleFocus}
            onWheel={(e) => e.target.blur()}
          />
        </div>
        <div>
          <button
            className="cart-tyre-button"
            onClick={() => removeFromCart(tyreData)}
          >
            &#x2715;
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartTyre;
