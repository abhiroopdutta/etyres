import React, {useState} from 'react';

export const CartContext = React.createContext();

export const CartProvider = (props) => {

    const [cart, setCart] = useState([]);
    const [services, setServices] = useState([
        {name:"fitting", price:0, quantity:0}, 
        {name:"valves", price:0, quantity:0}, 
        {name:"balancing", price:0, quantity:0},
        {name:"weights", price:0, quantity:0}, 
        {name:"alignment", price:0, quantity:0}])
    return(
        <CartContext.Provider value={ {tyresContext:[cart, setCart], servicesContext:[services, setServices]} }>
            {props.children}
        </CartContext.Provider>
        
    )
}