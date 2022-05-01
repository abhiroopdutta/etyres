import React, { useState, useEffect } from "react";
import Tyre from "./Tyre";
import "./Products.css";

function Products({ refreshProducts }) {
  const [tyres, setTyres] = useState([]);
  const [inStock, setInStock] = useState(true);
  let tyreData = tyres;
  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setTyres(data));
  }, [refreshProducts]);

  const [input, setInput] = useState("");
  const handleChange = (e) => {
    e.preventDefault(); //why use this
    setInput(e.target.value);
  };

  if (input.length > 0) {
    tyreData = tyreData.filter((i) => {
      return i.size.toString().match(input);
    });
  }

  const handleInStock = () => {
    setInStock((inStock) => !inStock);
  };
  if (inStock) {
    tyreData = tyreData.filter((i) => {
      return i.stock > 0;
    });
  }

  //udnerstand the live search feature rendering order
  return (
    <div className="products">
      <div className="product-filters">
        <input
          type="text"
          onChange={handleChange}
          value={input}
          placeholder="Enter tyre size"
        />
        <label htmlFor="in_stock">In Stock</label>
        <input
          type="checkbox"
          id="in_stock"
          name="in_stock"
          defaultChecked={inStock}
          onChange={handleInStock}
        />
      </div>
      <div className="product-items">
        {tyreData.map((tyre, index) => (
          <Tyre tyreData={tyre} key={tyre.itemCode} />
        ))}
      </div>
    </div>
  );
}

export default Products;
