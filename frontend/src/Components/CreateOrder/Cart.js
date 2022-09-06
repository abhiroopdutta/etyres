import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import CartTyre from "./CartTyre";
import "./Cart.css";
import Invoice from "./Invoice";
import { message } from "antd";
import { useTransition, animated } from "@react-spring/web";
import Button from "../Button";
import { dayjsUTC } from "../dayjsUTCLocal";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function Cart({ handleRefreshProducts }) {
  const { tyresContext, servicesContext } = useContext(CartContext);
  const [products, setProducts] = tyresContext;
  const [services, setServices] = servicesContext;
  const [cartTotal, setCartTotal] = useState(0);
  const [invoiceUpdateMode, setInvoiceUpdateMode] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState({
    invoiceNumber: 0,
    invoiceDate: "",
    invoiceStatus: "",
    customerDetails: {
      name: "",
      address: "",
      GSTIN: "",
      stateCode: "",
      state: "",
      vehicleNumber: "",
      contact: "",
    },
  });
  const [payment, setPayment] = useState({ cash: 0, card: 0, UPI: 0 });

  const [previewInvoice, setPreviewInvoice] = useState(false);
  const transitions = useTransition(previewInvoice, {
    config: { mass: 1, tension: 500, friction: 40, clamp: true },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  useEffect(() => {
    let scrollBarWidth = window.innerWidth - document.body.clientWidth;
    if (previewInvoice) {
      document.body.style.overflowY = "hidden";
      document.body.style.width = `calc(100% - ${scrollBarWidth}px)`;
    } else {
      setTimeout(() => {
        document.body.style.overflowY = "scroll";
        document.body.style.width = `100%`;
      }, 300);
    }
  }, [previewInvoice]);

  useEffect(() => {
    let productTotal = products.reduce(
      (productTotal, product) =>
        productTotal + product.price * product.quantity,
      0
    );

    let serviceTotal = services.reduce(
      (serviceTotal, service) =>
        serviceTotal + service.price * service.quantity,
      0
    );

    setCartTotal(Math.round(productTotal + serviceTotal));
  }, [products, services]);

  const handleServicesPrice = (serviceName, e) => {
    let price;
    if (e.target.value === "") {
      price = 0;
    } else {
      price = parseFloat(e.target.value);
    }
    e.preventDefault(); //why use this
    setServices((services) =>
      services.map((service) => {
        if (service.name === serviceName) {
          const updatedService = {
            ...service,
            price: price,
          };
          return updatedService;
        }
        return service;
      })
    );
  };

  const handleServicesQuantity = (serviceName, e) => {
    e.preventDefault(); //why use this
    let quantity;
    if (e.target.value === "") {
      quantity = 0;
    } else {
      quantity = parseInt(e.target.value);
    }
    setServices((services) =>
      services.map((service) => {
        if (service.name === serviceName) {
          const updatedService = {
            ...service,
            quantity: quantity,
          };
          return updatedService;
        }
        return service;
      })
    );
  };

  const handleFocus = (e) => e.target.select();

  const emptyCart = () => {
    setProducts([]);
    setServices((services) =>
      services.map((service) => {
        return {
          ...service,
          quantity: 0,
          price: 0,
        };
      })
    );
  };

  const hideInvoice = () => {
    if (invoiceUpdateMode) {
      emptyCart();
      setInvoiceUpdateMode(false);
      setSavedInvoice({
        invoiceNumber: 0,
        invoiceDate: "",
        invoiceStatus: "",
        customerDetails: {
          name: "",
          address: "",
          GSTIN: "",
          stateCode: "",
          state: "",
          vehicleNumber: "",
          contact: "",
        },
      });
      setPayment({ cash: 0, card: 0, UPI: 0 });
      handleRefreshProducts();
    }
    setPreviewInvoice(false);
  };

  const showInvoice = () => {
    // don't show invoice if any item is out of stock
    for (let i = 0; i < products.length; i++) {
      if (products[i].stock < products[i].quantity) {
        message.error(`${products[i].itemDesc}: Out of Stock`, 3);
        return;
      }
    }

    // don't show invoice if no products/services are added
    if (
      (products.length === 0 ||
        products.every((product) => product.quantity === 0)) &&
      services.every((service) => service.quantity === 0)
    ) {
      message.error(`Cart is empty !`, 2);
      return;
    }

    // don't show invoice if tube type tyre is added without tube
    let tubeItemCodes = ["U", "Y", "W"];
    let tubeTyreCount = products.reduce((tubeTyreCount, product) => {
      if (product.itemCode[1] === "T") {
        return tubeTyreCount + product.quantity;
      }
      return tubeTyreCount;
    }, 0);

    let tubeCount = products.reduce((tubeCount, product) => {
      if (tubeItemCodes.includes(product.itemCode[1])) {
        return tubeCount + product.quantity;
      }
      return tubeCount;
    }, 0);

    if (tubeCount < tubeTyreCount) {
      message.error(
        "You have added Tube Type Tyres without Tubes, please add tubes",
        3
      );
      return;
    }
    setPreviewInvoice(true);
    return;
  };

  const getUpdatedInvoice = (invoiceNumber) => {
    async function fetchUpdatedInvoice() {
      try {
        const response = await fetch(
          `/api/get_sales_invoice?invoiceNumber=${invoiceNumber}`
        );
        const result = await response.json();
        if (response.ok) {
          setInvoiceUpdateMode(true);
          setSavedInvoice(result);
          setPayment({ cash: 0, card: 0, UPI: 0 });
        } else {
          throw Error(result);
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchUpdatedInvoice();
  };

  return (
    <div className="cart-container">
      <div className="cart">
        <div className="cart-header">
          <div className="cart-title">CART SUMMARY</div>
          <div className="cart-invoice">
            <Button
              text="Preview Invoice"
              className="invoice-button"
              onClick={() => showInvoice()}
            />
            {/* {transitions((styles, previewInvoice) =>
              previewInvoice ? (
                <animated.div style={styles}> */}
            <Invoice
              visible={previewInvoice}
              onCancel={hideInvoice}
              updateMode={invoiceUpdateMode}
              products={products}
              services={services}
              savedInvoiceNumber={savedInvoice.invoiceNumber}
              savedInvoiceDate={dayjsUTC(
                savedInvoice.invoiceDate["$date"]
              ).format("YYYY-MM-DD")}
              savedInvoiceStatus={savedInvoice.invoiceStatus}
              savedCustomerDetails={savedInvoice.customerDetails}
              savedPayment={payment}
              updateInvoiceInParent={getUpdatedInvoice}
            />
            {/* </animated.div>
              ) : null
            )} */}
          </div>
        </div>

        <div className="cart-products">
          {products.map((product) => (
            <CartTyre tyreData={product} key={product.itemCode} />
          ))}{" "}
        </div>

        <div className="cart-services">
          {services.map((service) => (
            <div className="service" key={service.name}>
              <div className="service-name">{service.name}:</div>

              <div className="service-details">
                <div className="service-price">
                  <label htmlFor="service-price">Price: </label>
                  <input
                    className="service-price-input"
                    type="number"
                    min="0"
                    value={service.price}
                    onChange={(e) => handleServicesPrice(service.name, e)}
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                <div className="service-quantity">
                  <label htmlFor="service-quantity">Qty: </label>
                  <input
                    className="service-quantity-input"
                    type="number"
                    step="1"
                    min="0"
                    value={service.quantity}
                    onChange={(e) => handleServicesQuantity(service.name, e)}
                    onFocus={handleFocus}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">TOTAL: &#x20B9;{cartTotal}</div>
      </div>
    </div>
  );
}

export default Cart;
