import React from "react";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import CreateOrder from "./Components/CreateOrder/CreateOrder";
import UpdateStock from "./Components/UpdateStock/UpdateStock";
import Reports from "./Components/Reports/Reports";
import Accounts from "./Components/Accounts/Accounts";
import Services from "./Components/Services/Services";
import './AntStyles.css'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route path="/create-order" component={CreateOrder}></Route>
            <Route path="/update-stock" component={UpdateStock}></Route>
            <Route path="/reports" component={Reports}></Route>
            <Route path="/accounts" component={Accounts}></Route>
            <Route path="/Services" component={Services}></Route>
          </Switch>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
