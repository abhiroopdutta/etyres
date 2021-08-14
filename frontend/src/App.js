import './App.css';
import React, {useState, useEffect} from 'react';

function App() {

  useEffect(
    ()=>{
      fetch('/data')
      .then(res=>res.json())
      .then(data=>console.log(data))
    }, 
  []);

  return (
    <div className="App">
      <h1>Hello World!</h1>
    </div>
  );
}
export default App;
