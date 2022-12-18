import "./AddItem.css";
import { useState } from "react";
import React from "react";
import { message, Button } from "antd";

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function AddItem({
  invoiceNumber,
  item,
  toggleModal,
  dispatchInvoicesWithNewItems,
}) {
  const [vehicleType, setVehicleType] = useState("passenger car");
  const [costPrice, setCostPrice] = useState(
    roundToTwo(item.item_total / item.quantity)
  );
  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    toggleModal(false);
  };

  const handleCostPrice = (e) => {
    setCostPrice(e.target.value);
  };

  const handleVehicleType = (e) => {
    setVehicleType(e.target.value);
  };

  const handleAddtoInventory = () => {
    setLoading(true);
    let new_item = {
      vehicle_type: vehicleType,
      item_desc: item.item_desc,
      item_code: item.item_code,
      cost_price: costPrice,
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(new_item),
    };

    const submit_item = async () => {
      try {
        const response = await fetch("api/products", requestOptions);
        if (response.ok) {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setTimeout(
            () => message.success("Item added to inventory!", 2),
            1300
          );
          setTimeout(() => toggleModal(false), 1800);
          setTimeout(() => {
            dispatchInvoicesWithNewItems({
              type: "UPDATE_ITEM_STATUS",
              invoiceNumber: invoiceNumber,
              itemCode: item.item_code,
            });
          }, 2400);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    submit_item();
  };
  return (
    <div className="add-item-modal" onClick={handleCloseModal}>
      <div
        className="add-item-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="add-item-header">
          <strong>Add Item to inventory</strong>
          <button className="close-new-item-modal" onClick={handleCloseModal}>
            X
          </button>
        </header>

        <section className="add-item-body">
          <strong>{item.item_desc}</strong>
          <strong>{item.item_code}</strong>
          <label htmlFor="cost-price">Cost Price:</label>
          <input
            type="text"
            id="cost-price"
            name="cost-price"
            value={costPrice}
            onChange={handleCostPrice}
          />
          <label htmlFor="vehicle-type">Category</label>
          <select
            id="vehicle-type"
            name="vehicle-type"
            onChange={handleVehicleType}
          >
            <option value="passenger car">PCR</option>
            <option value="2 wheeler">2 Wheeler</option>
            <option value="3 wheeler">3 Wheeler</option>
            <option value="scv">SCV</option>
            <option value="tubeless valve">Tubeless Valve</option>
          </select>
        </section>

        <footer className="add-item-footer">
          <Button
            type="default"
            className="add-item-modal-button"
            loading={loading}
            onClick={handleAddtoInventory}
          >
            Add to Inventory
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default AddItem;
