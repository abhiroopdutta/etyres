import React, {useContext} from 'react';
import { CartContext } from './CartContext';

//object deconstruction in props
function Tyre({tyreData}){

    const {tyresContext, servicesContext} = useContext(CartContext);
    const [cart, setCart] = tyresContext;
    const [services, setServices] = servicesContext;

    const addToCart = (tyreData) => {

        //create cart tyre object
        const cartTyreData = {id:tyreData[3], desc:tyreData[1], 
            CP:tyreData[12], price:0, quantity:1};

        //check if item already in cart
        let foundItem = cart.find(cartTyre=>cartTyre.id === tyreData[3]);

        if(!foundItem){
            console.log("item doesn't exist in cart already")
            //understand this line of code
            setCart(current => [...current, cartTyreData]); //understand the spread, rest syntax
        }
        else{
            console.log("item exists in cart already")
            foundItem.quantity = parseInt(foundItem.quantity)+1;

            //find the index of the item where it exists in cart
            let foundItemIndex = cart.findIndex(cartTyre=>cartTyre.id === tyreData[3]);
            let cartCopy = [...cart];
            cartCopy[foundItemIndex] = foundItem;
            setCart(cartCopy);
        }
        
    }

    return(
        <div>
            <h4>{tyreData[1]}</h4>
            <span > CP: &#x20B9;{tyreData[12]}</span> <br/>
            <button onClick={()=>addToCart(tyreData)}>Add to cart</button>
            <hr/>
        </div>
    );
}

export default Tyre;