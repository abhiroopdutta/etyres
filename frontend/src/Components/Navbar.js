import { Link } from "react-router-dom";
import "./Navbar.css";
import React from "react";

function Navbar() {
  return (
    <nav className="navBar">
      <h1 className="nav-header">ETyres</h1>
      <div className="nav-links-container">
        <Link className="nav-link" to="/create_order">
          Create Order
        </Link>
        <Link className="nav-link" to="/update_stock">
          Update Purchases
        </Link>
        <Link className="nav-link" to="/update_price">
          Update Price List
        </Link>
        <Link className="nav-link" to="/reports">
          Reports
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
