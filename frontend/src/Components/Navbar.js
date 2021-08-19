import { Link } from 'react-router-dom';
// import './Navbar.css';

function Navbar() {
  return (
    <nav className="navBar">
      <h1>Eureka Tyres</h1>
      <div className="Links">
          <Link to="/create_order">Create Order</Link>
          <Link to="/update_stock">Update Stock</Link>
          <Link to="/update_price">Update Price List</Link>
          <Link to="/sales_report">Sales Report</Link> 
      </div>      
    </nav>
  );
}

export default Navbar;