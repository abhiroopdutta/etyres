import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';
import CartTyre from './CartTyre';
import './Cart.css';
import CartIcon from './cart-icon.png'

function Cart(){

    // eslint-disable-next-line 
    const [cart, setCart]= useContext(CartContext);
    const [services, setServices] = useState([
        {name:"fitting", price:0, quantity:0}, 
        {name:"valves", price:0, quantity:0}, 
        {name:"balancing", price:0, quantity:0},
        {name:"weights", price:0, quantity:0}, 
        {name:"alignment", price:0, quantity:0}])


    const handleServicesPrice = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...services];
        servicesCopy[index].price = e.target.value;
        setServices(servicesCopy);        
    }; 


    const handleServicesQuantity = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...services];
        servicesCopy[index].quantity = e.target.value;
        setServices(servicesCopy);        
    }; 

    const handleFocus = (e) => e.target.select();

    let tyresPrice = 0;
    for(let i=0; i<cart.length; i++){
        tyresPrice = tyresPrice+cart[i].price*cart[i].quantity;
    }  

    let servicesPrice=0;
    for(let i=0; i<services.length; i++){
        servicesPrice = servicesPrice+services[i].price*services[i].quantity;
    }

    let totalPrice = tyresPrice+servicesPrice;


    return(
        <div className="Cart"> 
            <img src={CartIcon} alt="Cart" width="50" height="50"/> <br/>
            {cart.map( (tyre, index)=> <CartTyre cartTyreData={tyre} key={index}/> )}  

            {services.map( (service, index)=>
            <div key={index}>
                <span>{service.name}:</span> 
                <span>price:</span> 
                <input type="text" value={service.price} onChange={(e)=>handleServicesPrice(index,e)} onFocus={handleFocus}/>
                <span>Quantity: </span>
                <input type="number" step="1" min="0" value={service.quantity} onChange={(e)=>handleServicesQuantity(index,e)} onFocus={handleFocus}/>
            </div>
            )}
            
            <span>Total price: &#x20B9;{totalPrice}</span>
            <br/>
            <button>Generate invoice </button>
        </div>
    );

}


export default Cart;