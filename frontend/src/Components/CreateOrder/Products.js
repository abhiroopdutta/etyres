import React, { useState } from "react";
import Tyre from "./Tyre";
import "./Products.css";
import { SearchOutlined } from "@ant-design/icons";
import { DebounceInput } from 'react-debounce-input';
import { useProductList } from "../../api/product";
import { Tag, Row, Col } from 'antd';
const { CheckableTag } = Tag;
const tagsData = [
  {
    label: "Tubeless Tyres",
    filterFn: (itemCode) => itemCode[1] === "L",
  },
  {
    label: "Tube Tyres",
    filterFn: (itemCode) => itemCode[1] === "T",
  },
  {
    label: "Tubes",
    filterFn: (itemCode) => ["U", "Y", "W"].includes(itemCode[1]),
  },
  {
    label: "Flaps",
    filterFn: (itemCode) => ["V", "X"].includes(itemCode[1]),
  },
  {
    label: "Valves",
    filterFn: (itemCode) => itemCode === "RR100TR414A",
  },
  {
    label: "Services",
    filterFn: (itemCode) => itemCode[0] === "S",
  },
];

function Products() {
  const [filters, setFilters] = useState({ tyreSize: "", inStock: true });
  const { isLoading, data: tyres, } = useProductList({});
  const [selectedTags, setSelectedTags] = useState(['Tubeless Tyres']);
  const handleTagChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);
  };
  let searchResults = tyres;
  let sizeFiltered = tyres;
  if (filters.tyreSize.length > 0) {
    sizeFiltered = tyres.filter((i) => {
      return i.size.toString().match(filters.tyreSize);
    });
  }

  //return products with stock greater than 0, make an exception for services
  let stockAndSizeFiltered = sizeFiltered;
  if (filters.inStock) {
    stockAndSizeFiltered = sizeFiltered?.filter((i) => {
      if (i.category === "service") {
        return true;
      }
      return i.stock > 0;
    });
  }
  searchResults = stockAndSizeFiltered;

  const handleChange = (e) => {
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

  const reducedFilterFn = (itemCode) => {
    let result = false;
    for (let selectedTag of selectedTags) {
      let filterFn = tagsData.find(tag => tag.label === selectedTag).filterFn;
      result = result || filterFn(itemCode);
    }
    return result;
  };
  searchResults = searchResults?.filter(item => reducedFilterFn(item.itemCode));
  //udnerstand the live search feature rendering order
  return (
    <div className="products">
      <div className="product-filters">
        <Row align="bottom" gutter={[10, 20]}>
          <Col xl={10} xxl={6}>
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
          </Col>
          <Col xl={14} xxl={16}>
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
          </Col>

          <Col>
            {tagsData.map((tag) => (
              <CheckableTag
                key={tag.label}
                checked={selectedTags.indexOf(tag.label) > -1}
                onChange={(checked) => handleTagChange(tag.label, checked)}
              >
                {tag.label}
              </CheckableTag>
            ))}
          </Col>
        </Row>
      </div>
      <div className="product-items">
        {isLoading ?
          null :
          searchResults.map((tyre) => (
            <Tyre tyreData={tyre} key={tyre.itemCode} />
          ))}
      </div>
    </div >
  );
}

export default Products;
