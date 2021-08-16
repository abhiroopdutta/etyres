import './App.css';
import React, {useState, useEffect} from 'react';

//object deconstruction **
function Tyres({tyreData}) {

  let nba = [{name:"1009017"}, {name:"1459017"}, {name:"1559017"}]


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
    <div>
        <input type="text" onChange={handleChange} value={input} />
        {tyreData.map(
          (tyre, index)=>{
            return(
              //why use key here?
              <div key={index}> 
                <ul>
                  <li>
                    desc:{tyre[1]} taxable_CP:{tyre[8]} total_CP:{tyre[12]} 
                  </li>
                </ul>
              </div>
            )
          }
        )
      }
    </div>
    
  );
}

function App() {

  const [tyres, setTyres] = useState([]);

  useEffect(
    ()=>{
      fetch('/data')
      .then(res=>res.json())
      .then(data=>setTyres(data))
    }, 
  []);

 

  return (
    <div className="App">
      <Tyres tyreData={tyres}/>
    </div>
  );
}
export default App;
