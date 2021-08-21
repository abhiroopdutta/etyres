import React, {useContext} from 'react';
import { CartContext } from './CartContext';


//object deconstruction in props
function CartTyre({tyreData}){

    const [cart, setCart] = useContext(CartContext);
    const removeFromCart = (tyreData) => {
        
        //understand the filter code below
        let cartCopy = [...cart];
        cartCopy = cartCopy.filter(cartItem => cartItem[3]!== tyreData[3])

        //understand this line of code
        setCart(cartCopy); //understand the spread, rest syntax
    }

    return(
        <div>
            <h4>{tyreData[1]}</h4>
            <h5>total_CP: {tyreData[12]}</h5>
            <button onClick={()=>removeFromCart(tyreData)}>Remove</button>
            <hr/>
        </div>
    );
}

export default CartTyre;