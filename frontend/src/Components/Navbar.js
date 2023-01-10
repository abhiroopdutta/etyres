import { Link } from "react-router-dom";
import "./Navbar.css";
import React from "react";

function Navbar() {
  return (
    <nav className="navBar">
      <Link to="/create-order">
        <h1 className="nav-header">ETyres</h1>
      </Link>
      <div className="nav-links-container">
        <Link className="nav-link" to="/create-order">
          Create Order
        </Link>
        <Link className="nav-link" to="/update-stock">
          Update Purchases
        </Link>
        <Link className="nav-link" to="/reports">
          Reports
        </Link>
        <Link className="nav-link" to="/accounts">
          Accounts
        </Link>
        <Link className="nav-link" to="/Services">
          Services
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
