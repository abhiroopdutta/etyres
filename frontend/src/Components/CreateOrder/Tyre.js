import React, {useContext} from 'react';
import { CartContext } from './CartContext';
import './Tyre.css'
import TyreImg from './tyre-img.png'

//object deconstruction in props
function Tyre({tyreData}){

    const {tyresContext, servicesContext} = useContext(CartContext);
    const [cart, setCart] = tyresContext;
    // eslint-disable-next-line 
    const [services, setServices] = servicesContext;

    const addToCart = (tyreData) => {

        //create cart tyre object
        const cartTyreData = {
            itemDesc: tyreData.itemDesc, 
            itemCode: tyreData.itemCode, 
            HSN: tyreData.HSN,  
            GST: tyreData.GST,
            category: tyreData.category, 
            size: tyreData.size, 
            costPrice: tyreData.costPrice, 
            stock:  tyreData.stock,
            price: tyreData.costPrice, 
            quantity: 1};

        //check if item already in cart
        let foundItem = cart.find(cartTyre=>cartTyre.itemCode === tyreData.itemCode);

        if(!foundItem){
            //understand this line of code
            setCart(current => [...current, cartTyreData]); //understand the spread, rest syntax
        }
        else{
            foundItem.quantity = parseInt(foundItem.quantity)+1;

            //find the index of the item where it exists in cart
            let foundItemIndex = cart.findIndex(cartTyre=>cartTyre.itemCode === tyreData.itemCode);
            let cartCopy = [...cart];
            cartCopy[foundItemIndex] = foundItem;
            setCart(cartCopy);
        }
        
    }

    return(
            <div className="product">
                    <div className="product-title">{tyreData.itemDesc}</div>
                    <div className="product-image"><img  src={TyreImg} alt="tyre" width="80" height="120"/></div> 
                    <div className="product-cost-price"> Cost Price: &#x20B9;{tyreData.costPrice}</div>
                    <div className="product-stock">Items in stock:{tyreData.stock}</div>
                    <div className="product-button"><button onClick={()=>addToCart(tyreData)}>Add to cart</button></div>
            </div>            
    );
}

export default Tyre;