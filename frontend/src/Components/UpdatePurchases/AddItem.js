import "./AddItem.css";
import { useState } from "react";
import React from "react";
import { message, Button } from "antd";
import { useCreateProduct } from "../../api/product";

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
  const { mutate: createProduct, isLoading: isLoadingCreateProduct } = useCreateProduct({
    onSuccess: () => {
      toggleModal(false);
      setTimeout(
        () => message.success("Item added to inventory!", 2),
        700
      );
      setTimeout(() => {
        dispatchInvoicesWithNewItems({
          type: "UPDATE_ITEM_STATUS",
          invoiceNumber: invoiceNumber,
          itemCode: item.item_code,
        });
      }, 1100);
    }
  });
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
    let newItem = {
      vehicle_type: vehicleType,
      item_desc: item.item_desc,
      item_code: item.item_code,
      cost_price: costPrice,
    };
    createProduct(newItem);
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
            loading={isLoadingCreateProduct}
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
