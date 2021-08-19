import React, {useState, useEffect} from 'react';
import './Shop.css';

//object deconstruction **
function Shop() {

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

  //udnerstand the below code
  return (
    <div className="tyres">
        <input type="text" onChange={handleChange} value={input} placeholder="Enter tyre size"/>
        {tyreData.map(
          (tyre, index)=>{
            return(
              //why use key here?
              <div key={index}> 
                <ul>                  
                  <li> desc:{tyre[1]} taxable_CP:{tyre[8]} total_CP:{tyre[12]} </li>                  
                  <button type="button"> Add to cart</button>
                </ul>
              </div>
            )
          }
        )
      }
    </div>
    
  );
}


export default Shop;
