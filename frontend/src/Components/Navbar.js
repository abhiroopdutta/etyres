import { Link } from "react-router-dom";
import "./Navbar.css";
import React from "react";

function Navbar() {
  return (
    <nav className="navBar">
      <h1>ETyres</h1>
      <div className="Links">
        <Link to="/reports">Reports</Link>
        <Link to="/update_price">Update Price List</Link>
        <Link to="/update_stock">Update Stock</Link>
        <Link to="/create_order">Create Order</Link>
      </div>
    </nav>
  );
}

export default Navbar;
