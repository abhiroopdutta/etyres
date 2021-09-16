import React, {useState} from 'react';

export const CartContext = React.createContext();

export const CartProvider = (props) => {

    const [cart, setCart] = useState([]);
    const [services, setServices] = useState([
        {name:"Fitting", price:0, quantity:0, hsn:"998714"}, 
        {name:"Valves", price:0, quantity:0, hsn:"000000"}, 
        {name:"Balancing", price:0, quantity:0, hsn:"998714 "},
        {name:"Weights", price:0, quantity:0, hsn:"-"},
        {name:"Alignment", price:0, quantity:0, hsn:"998714 "}])
    return(
        <CartContext.Provider value={ {tyresContext:[cart, setCart], servicesContext:[services, setServices]} }>
            {props.children}
        </CartContext.Provider>
        
    )
}