import React, { useState } from "react";

export const CartContext = React.createContext();

export const CartProvider = (props) => {
  const [cart, setCart] = useState([]);
  const [services, setServices] = useState([
    { name: "Fitting", price: 0, quantity: 0, HSN: "998714", GST: "0.18" },
    { name: "Balancing", price: 0, quantity: 0, HSN: "998714", GST: "0.18" },
    { name: "Weights", price: 0, quantity: 0, HSN: "-", GST: "0.0" },
    { name: "Alignment", price: 0, quantity: 0, HSN: "998714", GST: "0.18" },
  ]);
  return (
    <CartContext.Provider
      value={{
        tyresContext: [cart, setCart],
        servicesContext: [services, setServices],
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
};
