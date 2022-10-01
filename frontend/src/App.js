import React from "react";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import CreateOrder from "./Components/CreateOrder/CreateOrder";
import UpdatePrice from "./Components/UpdatePrice/UpdatePrice";
import UpdateStock from "./Components/UpdateStock/UpdateStock";
import Reports from "./Components/Reports/Reports";
import Accounts from "./Components/Accounts/Accounts";
import './AntStyles.css'


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Switch>
          <Route path="/create_order" component={CreateOrder}></Route>
          <Route path="/update_stock" component={UpdateStock}></Route>
          <Route path="/update_price" component={UpdatePrice}></Route>
          <Route path="/reports" component={Reports}></Route>
          <Route path="/accounts" component={Accounts}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
