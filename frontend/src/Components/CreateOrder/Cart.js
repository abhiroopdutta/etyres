import React, { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import CartTyre from "./CartTyre";
import "./Cart.css";
import Invoice from "./Invoice";
import { message, Button, Modal } from "antd";
import { dayjsUTC } from "../dayjsUTCLocal";
import { useSaleInvoice } from "../../api/sale";
import { ExclamationCircleFilled } from '@ant-design/icons';

function Cart() {
  const { confirm } = Modal;
  const { tyresContext } = useContext(CartContext);
  const [products, setProducts] = tyresContext;
  let cartTotal = 0;
  const [previewInvoice, setPreviewInvoice] = useState(false);
  const [updatedInvoiceNumber, setUpdatedInvoiceNumber] = useState();
  const { isSuccess: isSuccessFetchSavedInvoice, data: savedInvoice, } = useSaleInvoice({
    invoiceNumber: updatedInvoiceNumber,
    enabled: !!updatedInvoiceNumber,
  });

  let scrollBarWidth = window.innerWidth - document.body.clientWidth;
  if (previewInvoice) {
    document.body.style.overflowY = "hidden";
    document.body.style.width = `calc(100% - ${scrollBarWidth}px)`;
  } else {
    document.body.style.overflowY = "scroll";
    document.body.style.width = `100%`;
  }

  let productTotal = products.reduce(
    (productTotal, product) =>
      productTotal + product.price * product.quantity,
    0
  );

  cartTotal = Math.round(productTotal);

  const emptyCart = () => {
    setProducts([]);
  };

  const hideInvoice = () => {
    if (isSuccessFetchSavedInvoice) {
      emptyCart();
      setUpdatedInvoiceNumber(null);
    }
    setPreviewInvoice(false);
  };

  const showInvoice = () => {
    // don't show invoice if any item is out of stock, make an exception for services
    for (let i = 0; i < products.length; i++) {

      if (products[i].category === "service") {
        continue;
      }

      if (products[i].stock < products[i].quantity) {
        message.error(`${products[i].itemDesc}: Out of Stock`, 3);
        return;
      }
    }

    // don't show invoice if no products/services are added
    if (
      (products.length === 0 ||
        products.every((product) => product.quantity === 0))
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
      showConfirm();
      return;
    }
    setPreviewInvoice(true);
    return;
  };

  const showConfirm = () => {
    confirm({
      title: 'Tube tyres without tube',
      icon: <ExclamationCircleFilled />,
      content: 'You have added tube tyres without tube, proceed?',
      onOk() {
        setPreviewInvoice(true);
      },
      onCancel() {
        return;
      },
    });
  };

  return (
    <div className="cart-container">
      <div className="cart">
        <div className="cart-header">
          <div className="cart-title">CART SUMMARY</div>
          <div className="cart-invoice">
            <Button
              type="default"
              className="invoice-button"
              onClick={() => showInvoice()}
            >
              Preview Invoice
            </Button>
            {isSuccessFetchSavedInvoice ?
              <Invoice
                visible={previewInvoice}
                onCancel={hideInvoice}
                updateMode={true}
                products={savedInvoice.productItems}
                updateInvoiceInParent={setUpdatedInvoiceNumber}
                savedInvoiceNumber={savedInvoice.invoiceNumber}
                savedInvoiceDate={dayjsUTC(
                  savedInvoice.invoiceDate).format("YYYY-MM-DD")}
                savedInvoiceStatus={savedInvoice.invoiceStatus}
                savedCustomerDetails={savedInvoice.customerDetails}
                savedPayment={savedInvoice.payment}
              /> :
              <Invoice
                visible={previewInvoice}
                onCancel={hideInvoice}
                updateMode={false}
                products={products}
                updateInvoiceInParent={setUpdatedInvoiceNumber}
              />
            }
          </div>
        </div>

        <div className="cart-products">
          {products.length === 0 ?
            <h3 className="empty-cart-msg">Empty Cart, please add products to order.</h3>
            : products.map((product) => (
              <CartTyre tyreData={product} key={product.itemCode} />
            ))}{" "}
        </div>

        <div className="cart-total">TOTAL: &#x20B9;{cartTotal}</div>
      </div>
    </div>
  );
}

export default Cart;
