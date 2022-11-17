import React, { useState, useEffect } from "react";
import Tyre from "./Tyre";
import "./Products.css";
import { SearchOutlined } from "@ant-design/icons";
import { DebounceInput } from 'react-debounce-input';

function Products({ refreshProducts }) {
  const [tyres, setTyres] = useState([]);
  const [filters, setFilters] = useState({ tyreSize: "", inStock: true });
  let searchResults = tyres;

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        setTyres(data);
      });
  }, [refreshProducts]);

  let sizeFiltered = tyres;
  if (filters.tyreSize.length > 0) {
    sizeFiltered = tyres.filter((i) => {
      return i.size.toString().match(filters.tyreSize);
    });
  }

  let stockAndSizeFiltered = sizeFiltered;
  if (filters.inStock) {
    stockAndSizeFiltered = sizeFiltered.filter((i) => {
      return i.stock > 0;
    });
  }
  searchResults = stockAndSizeFiltered;

  const handleChange = (e) => {
    setFilters({ ...filters, tyreSize: e.target.value });
    console.log(e.target.value);
  };

  const handleInStock = () => {
    setFilters((filters) => {
      return {
        ...filters,
        inStock: !filters.inStock,
      };
    });
  };

  //udnerstand the live search feature rendering order
  return (
    <div className="products">
      <div className="product-filters">

        <div className="products-search">
          <SearchOutlined />
          <label htmlFor="products-search"></label>
          <DebounceInput
            debounceTimeout={300}
            onChange={handleChange}
            id="products-search"
            type="text"
            value={filters.tyreSize}
            placeholder="Search tyre, ex -1357012"
          />

        </div>
        <div className="in-stock-checkbox">
          <label htmlFor="in_stock">In Stock </label>
          <input
            type="checkbox"
            id="in_stock"
            name="in_stock"
            defaultChecked={filters.inStock}
            onChange={handleInStock}
          />
        </div>
      </div>
      <div className="product-items">
        {searchResults.map((tyre) => (
          <Tyre tyreData={tyre} key={tyre.itemCode} />
        ))}
      </div>
    </div >
  );
}

export default Products;
