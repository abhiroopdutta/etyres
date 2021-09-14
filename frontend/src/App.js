import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import CreateOrder from './Components/CreateOrder';
import UpdatePrice from './Components/UpdatePrice';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Switch>
          <Route path="/create_order" component={CreateOrder}></Route>
          <Route path="/update_stock"> Update Stock is under construction </Route>
          <Route path="/update_price" component={UpdatePrice}></Route>
          <Route path="/sales_report"> Sales Report is under construction </Route> 
        </Switch>
      </div>
    </Router>
  );
}

export default App;