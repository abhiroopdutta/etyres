import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Shop from './Components/Shop'; 
import Navbar from './Components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Switch>
          <Route path="/create_order"> <Shop/> </Route>
          <Route path="/update_stock"> Update Stock is under construction </Route>
          <Route path="/update_price"> Update Price is under construction </Route>
          <Route path="/sales_report"> Sales Report is under construction </Route> 
        </Switch>

      </div>
    </Router>
  );
}

export default App;