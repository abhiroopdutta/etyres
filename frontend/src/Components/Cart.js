import React, {useContext} from 'react';
import { CartContext } from './CartContext';
import CartTyre from './CartTyre';
import './Cart.css';

function Cart(){

    const [cart, SetCart]= useContext(CartContext);
    return(
        <div className="Cart"> 
            {cart.map( (tyre, index)=> <CartTyre tyreData={tyre} key={index}/> )} 
            <span>Tyre Changing: </span> <input></input>
            <br/>
            <span>Valves: </span> <input></input>
            <br/>
            <span>Balancing: </span> <input></input>
            <br/>
            <span>Balancing Weights: </span> <input></input>
            <br/>
            <span>Alignment: </span> <input></input>
            <br/>
            <br/>
            <span>Items in Cart :{cart.length}</span>
            <br/>
            <span>Total price 0</span>
        </div>
    );

}


export default Cart;