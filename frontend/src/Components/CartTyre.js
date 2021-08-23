import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';


//object deconstruction in props
function CartTyre({cartTyreData}){

    const [cart, setCart] = useContext(CartContext);
    const[SP, setSP] = useState(0);
    const removeFromCart = (cartTyreData) => {
        
        //understand the filter code below
        let cartCopy = [...cart];
        cartCopy = cartCopy.filter(cartItem => cartItem.id!== cartTyreData.id)

        //understand this line of code
        setCart(cartCopy); //understand the spread, rest syntax
    }

    const handleSP = (e) =>{
        e.preventDefault(); //why use this
        setSP(e.target.value);
        cartTyreData.price = e.target.value;

        //forcefully update the cart context, to render the parent(i.e. cart)
        let cartCopy = [...cart];
        setCart(cartCopy);
        
    }; 

    return(
        <div>
            <h4>{cartTyreData.desc}</h4> 
            <span>CP: {cartTyreData.CP}</span> 
            <span>SP: </span> <input type="text" onChange={handleSP} value={SP}/>
            <br/>
            <span>Quantity: {cartTyreData.quantity}</span>
            <button onClick={()=>removeFromCart(cartTyreData)}>Remove</button>
            <hr/>
        </div>
    );
}

export default CartTyre;