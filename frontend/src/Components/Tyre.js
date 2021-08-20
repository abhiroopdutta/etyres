import React from 'react';

//object deconstruction in props
function Tyre({tyreData}){
    return(
        <div>
            <h4>{tyreData[1]}</h4>
            <h5>total_CP: {tyreData[12]}</h5>
            <button>Add to cart</button>
            <hr/>
        </div>
    );
}

export default Tyre;