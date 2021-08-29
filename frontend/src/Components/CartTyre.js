import React, {useContext} from 'react';
import { CartContext } from './CartContext';
import './CartTyre.css'


//object deconstruction in props
function CartTyre({tyreData}){

    const {tyresContext, servicesContext} = useContext(CartContext);
    const [cart, setCart] = tyresContext;
    // eslint-disable-next-line 
    const [services, setServices] = servicesContext;
  
    const removeFromCart = (tyreData) => {
        
        //understand the filter code below
        let cartCopy = [...cart];
        cartCopy = cartCopy.filter(cartItem => cartItem.id!== tyreData.id)

        //understand this line of code
        setCart(cartCopy); //understand the spread, rest syntax
    }

    const handlePrice = (e) =>{
        e.preventDefault(); //why use this
        tyreData.price = e.target.value;

        //forcefully update the cart context, to render the parent(i.e. Cart)
        //since totalPrice (part of parent Cart) is affected by tyreData price
        let cartCopy = [...cart];
        setCart(cartCopy);
        
    }; 

    const handleFocus = (e) => e.target.select();

   
    const handleQuantity = (e) =>{
        e.preventDefault(); //why use this
        tyreData.quantity = e.target.value;

        //forcefully update the cart context, to render the parent(i.e. cart)
        let cartCopy = [...cart];
        setCart(cartCopy);
        
    };

    return(
        <div className="cart-tyre">
            <div className="cart-tyre-name">{tyreData.desc}</div> 
            <span className="cart-tyre-CP">CP:{tyreData.CP}</span> 
            <span className="cart-tyre-price">
                <span>Price: </span>
                <input type="text" value={tyreData.price} onChange={handlePrice} onFocus={handleFocus}/>
            </span>
            <span className="cart-tyre-quantity">
                <span>Quantity: </span>
                <input type="number" step="1" min="1" value={tyreData.quantity} onChange={handleQuantity} onFocus={handleFocus}/>
            </span>
            <button onClick={()=>removeFromCart(tyreData)}>Remove</button>
        </div>
    );
}

export default CartTyre;