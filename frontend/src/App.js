import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import CreateOrder from './Components/CreateOrder';
import UpdatePrice from './Components/UpdatePrice';
import UpdateStock from './Components/UpdateStock';
import SalesReport from './Components/SalesReport';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Switch>
          <Route path="/create_order" component={CreateOrder}></Route>
          <Route path="/update_stock" component={UpdateStock}></Route>
          <Route path="/update_price" component={UpdatePrice}></Route>
          <Route path="/sales_report" component={SalesReport}></Route> 
        </Switch>
      </div>
    </Router>
  );
}

export default App;