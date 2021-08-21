import React, {useContext} from 'react';
import { CartContext } from './CartContext';


//object deconstruction in props
function Tyre({tyreData}){

    const [cart, setCart] = useContext(CartContext);
    const addToCart = (tyreData) => {
        
        //understand this line of code
        setCart(current => [...current, tyreData]); //understand the spread, rest syntax
    }

    return(
        <div>
            <h4>{tyreData[1]}</h4>
            <h5>total_CP: {tyreData[12]}</h5>
            <button onClick={()=>addToCart(tyreData)}>Add to cart</button>
            <hr/>
        </div>
    );
}

export default Tyre;