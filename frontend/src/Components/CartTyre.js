import React, {useContext} from 'react';
import { CartContext } from './CartContext';


//object deconstruction in props
function CartTyre({cartTyreData}){

    const [cart, setCart] = useContext(CartContext);

    const removeFromCart = (cartTyreData) => {
        
        //understand the filter code below
        let cartCopy = [...cart];
        cartCopy = cartCopy.filter(cartItem => cartItem.id!== cartTyreData.id)

        //understand this line of code
        setCart(cartCopy); //understand the spread, rest syntax
    }

    const handlePrice = (e) =>{
        e.preventDefault(); //why use this
        cartTyreData.price = e.target.value;

        //forcefully update the cart context, to render the parent(i.e. cart)
        let cartCopy = [...cart];
        setCart(cartCopy);
        
    }; 

    const handleFocus = (e) => e.target.select();

   
    const handleQuantity = (e) =>{
        e.preventDefault(); //why use this
        cartTyreData.quantity = e.target.value;

        //forcefully update the cart context, to render the parent(i.e. cart)
        let cartCopy = [...cart];
        setCart(cartCopy);
        
    };

    return(
        <div>
            <h4>{cartTyreData.desc}</h4> 
            <span>CP: {cartTyreData.CP}</span> 
            <span>price: </span> <input type="text" value={cartTyreData.price} onChange={handlePrice} onFocus={handleFocus}/>
            <br/>
            <span>Quantity: </span>
            <input type="number" step="1" min="1" value={cartTyreData.quantity} onChange={handleQuantity} onFocus={handleFocus}/>
            <button onClick={()=>removeFromCart(cartTyreData)}>Remove</button>
            <hr/>
        </div>
    );
}

export default CartTyre;