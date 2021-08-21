import React, {useState, useEffect} from 'react';
import Tyre from './Tyre';
import './Products.css';

function Products() {

    const [tyres, setTyres] = useState([]);
  
    let tyreData = tyres;
    useEffect(
      ()=>{
        fetch('/data')
        .then(res=>res.json())
        .then(data=>setTyres(data))
      }, 
    []);
  
    const [input, setInput] = useState("");
    const handleChange = (e) =>{
      e.preventDefault(); //why use this
      setInput(e.target.value);
    };
  
    if(input.length>0){
      tyreData= tyreData.filter((i)=>{
        return i[2].toString().match(input);
      })
    }
  
    //udnerstand the live search feature rendering order
    return (
      <div className="tyres">
          <input type="text" onChange={handleChange} value={input} placeholder="Enter tyre size"/>
          {tyreData.map( (tyre, index)=> <Tyre tyreData={tyre} key={index}/> )}  
      </div>    
    );
  }
  
  
  export default Products;