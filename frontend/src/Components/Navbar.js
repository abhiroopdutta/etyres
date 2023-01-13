import { NavLink } from "react-router-dom";
import "./Navbar.css";
import React from "react";

function Navbar() {
  return (
    <nav className="navBar">
      <NavLink to="/" exact>
        <h1 className="nav-header">ETyres</h1>
      </NavLink>
      <div className="nav-links-container">
        <NavLink className="nav-link" to="/" exact>
          Create Order
        </NavLink>
        <NavLink className="nav-link" to="/update-purchase">
          Update Purchase
        </NavLink>
        <NavLink className="nav-link" to="/reports">
          Reports
        </NavLink>
        <NavLink className="nav-link" to="/accounts">
          Accounts
        </NavLink>
        <NavLink className="nav-link" to="/services">
          Services
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
