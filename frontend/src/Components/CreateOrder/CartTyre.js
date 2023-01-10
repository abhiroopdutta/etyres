import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import { Input, Form, Col, Row, Button } from "antd";
import {
  DeleteOutlined,
} from "@ant-design/icons";

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
    <>
      <Row>
        <Col>
          <h4 >{tyreData.itemDesc}</h4>
        </Col>
      </Row>
      <Row gutter={20} style={{ display: "flex", justifyContent: "space-between" }}>
        <Col >
          <Form.Item label="Price"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            labelAlign="left"
            style={{ maxWidth: "200px" }}
          >
            <Input
              fieldname="price"
              value={tyreData.price}
              onChange={handlePrice}
              onFocus={handleFocus}
              type="number"
              min="0"
              addonBefore="&#8377;"
            />
          </Form.Item>
        </Col>
        <Col >
          <Form.Item label="Qty"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: "150px" }}
          >
            <Input
              fieldname="quantity"
              value={tyreData.quantity}
              onChange={handleQuantity}
              onFocus={handleFocus}
              type="number"
              min="0"
              step="1"
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
          >
            <Button
              icon={<DeleteOutlined style={{ color: "var(--lightest)" }} />}
              style={{ maxWidth: "50px" }}
              onClick={() => removeFromCart(tyreData)}
            >
            </Button>
          </Form.Item>
        </Col>
      </Row >
    </>
  );
}

export default CartTyre;
