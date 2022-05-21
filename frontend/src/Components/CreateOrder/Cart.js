import React, { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import CartTyre from "./CartTyre";
import "./Cart.css";
import Invoice from "./Invoice";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function Cart({ handleRefreshProducts }) {
  const { tyresContext, servicesContext } = useContext(CartContext);
  // eslint-disable-next-line
  const [cart, setCart] = tyresContext;
  // eslint-disable-next-line
  const [services, setServices] = servicesContext;

  const [previewInvoice, setPreviewInvoice] = useState(false);

  const handleServicesPrice = (index, e) => {
    e.preventDefault(); //why use this
    let servicesCopy = [...services];
    servicesCopy[index].price = e.target.value;
    setServices(servicesCopy);
  };

  const handleServicesQuantity = (index, e) => {
    e.preventDefault(); //why use this
    let servicesCopy = [...services];
    servicesCopy[index].quantity = e.target.value;
    setServices(servicesCopy);
  };

  const handleFocus = (e) => e.target.select();

  const emptyCart = () => {
    setCart([]);
    let servicesCopy = [...services];
    servicesCopy.forEach((service) => {
      service.quantity = 0;
      service.price = 0;
    });
    setServices(servicesCopy);
  };

  const hideInvoice = (orderConfirmed) => {
    if (orderConfirmed) {
      emptyCart();
      handleRefreshProducts();
    }
    setPreviewInvoice(false);
  };

  const showInvoice = () => {
    //setServices(services);
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].stock < cart[i].quantity) {
        alert(`${cart[i].itemDesc}: Out of Stock`);
        return;
      }
    }

    if (cart.length === 0) {
      for (let i = 0; i < services.length; i++) {
        if (services[i].quantity !== 0) {
          break;
        }

        if (i === services.length - 1 && services[i].quantity === 0) {
          alert("Cart is empty !");
          return;
        }
      }
    }
    setPreviewInvoice(true);
    return;
  };

  let tyresPrice = 0;
  for (let i = 0; i < cart.length; i++) {
    tyresPrice = tyresPrice + cart[i].price * cart[i].quantity;
  }

  let servicesPrice = 0;
  for (let i = 0; i < services.length; i++) {
    servicesPrice = servicesPrice + services[i].price * services[i].quantity;
  }

  let totalPrice = roundToTwo(tyresPrice + servicesPrice);

  return (
    <div className="cart-container">
      <div className="cart">
        <div className="cart-header">
          <div className="cart-title">CART SUMMARY</div>
          <div className="cart-invoice">
            <button className="invoice-button" onClick={() => showInvoice()}>
              Preview invoice
            </button>
            {previewInvoice ? (
              <Invoice
                products={cart}
                services={services}
                hideInvoice={hideInvoice}
              />
            ) : null}
          </div>
        </div>

        <div className="cart-products">
          {cart.map((tyre, index) => (
            <CartTyre tyreData={tyre} key={tyre.itemCode} />
          ))}{" "}
        </div>

        <div className="cart-services">
          {services.map((service, index) => (
            <div className="service" key={service.name}>
              <div className="service-name">{service.name}:</div>

              <div className="service-details">
                <div className="service-price">
                  Price:
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => handleServicesPrice(index, e)}
                    onFocus={handleFocus}
                  />
                </div>

                <div className="service-quantity">
                  Qty:
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={service.quantity}
                    onChange={(e) => handleServicesQuantity(index, e)}
                    onFocus={handleFocus}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">Total price: &#x20B9;{totalPrice}</div>
        <br />
      </div>
    </div>
  );
}

export default Cart;
