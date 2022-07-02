import React, { useState, useEffect } from "react";
import Tyre from "./Tyre";
import "./Products.css";

function Products({ refreshProducts }) {
  const [tyres, setTyres] = useState([]);
  const [filters, setFilters] = useState({ tyreSize: "", inStock: true });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        setTyres(data);
        setSearchResults(data);
        setFilters({ tyreSize: "", inStock: true });
      });
  }, [refreshProducts]);

  useEffect(() => {
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
    setSearchResults(stockAndSizeFiltered);
  }, [filters, tyres]);

  const handleChange = (e) => {
    e.preventDefault(); //why use this
    setFilters({ ...filters, tyreSize: e.target.value });
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
        <div className="search-product">
          <input
            type="text"
            onChange={handleChange}
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
    </div>
  );
}

export default Products;
