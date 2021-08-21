import React, {useState} from 'react';

export const CartContext = React.createContext();

export const CartProvider = (props) => {

    const [cart, SetCart] = useState([]);
    return(
        <CartContext.Provider value={[cart, SetCart]}>
            {props.children}
        </CartContext.Provider>
        
    )
}