import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';
import CartTyre from './CartTyre';
import './Cart.css';
import CartIcon from './cart-icon.png'

function Cart(){

    // eslint-disable-next-line 
    const [cart, setCart]= useContext(CartContext);
    const [fitting, setFitting] = useState(0);
    const [fittingQuantity, setFittingQuantity] = useState(1);
    const [valves, setValves] = useState(0);
    const [valvesQuantity, setValvesQuantity] = useState(1);
    const [balancing, setBalancing] = useState(0);
    const [balancingQuantity, setBalancingQuantity] = useState(1);
    const [weights, setWeights] = useState(0);
    const [alignment, setAlignment] = useState(0);


    const handleFitting = (e) =>{
        e.preventDefault(); //why use this
        setFitting(e.target.value);
      };
    
    const handleFittingQuantity = (e) =>{
        e.preventDefault(); //why use this
        setFittingQuantity(e.target.value);
    };


    const handleValves = (e) =>{
        e.preventDefault(); //why use this
        setValves(e.target.value);
      };

    const handleValvesQuantity = (e) =>{
        e.preventDefault(); //why use this
        setValvesQuantity(e.target.value);
    };

    const handleBalancingQuantity = (e) =>{
        e.preventDefault(); //why use this
        setBalancingQuantity(e.target.value);
    };

    const handleBalancing = (e) =>{
        e.preventDefault(); //why use this
        setBalancing(e.target.value);
    };

    const handleWeights = (e) =>{
        e.preventDefault(); //why use this
        setWeights(e.target.value);
      };

    const handleAlignment = (e) =>{
        e.preventDefault(); //why use this
        setAlignment(e.target.value);
    };  

    let tyresPrice = 0;
    for(let i=0; i<cart.length; i++){
        tyresPrice = tyresPrice+cart[i].price*cart[i].quantity;
    }  

    const totalPrice = parseFloat(tyresPrice)+
    parseInt(fitting)*parseInt(fittingQuantity)+
    parseInt(valves)*parseInt(valvesQuantity)+
    parseInt(balancing)*parseInt(balancingQuantity)+
    parseInt(weights)+
    parseInt(alignment);

    return(
        <div className="Cart"> 
            <img src={CartIcon} alt="Girl in a jacket" width="50" height="50"/> <br/>
            {cart.map( (tyre, index)=> <CartTyre cartTyreData={tyre} key={index}/> )}  
            
            <span>Tyre fitting: </span> <input type="text" onChange={handleFitting} value={fitting}/>
            <span>Quantity: </span> <input type="text" onChange={handleFittingQuantity} value={fittingQuantity}/>
            <br/>
            <span>Valves: </span> <input type="text" onChange={handleValves} value={valves}/>
            <span>Quantity: </span> <input type="text" onChange={handleValvesQuantity} value={valvesQuantity}/>
            <br/>
            <span>Balancing: </span> <input type="text" onChange={handleBalancing} value={balancing}/>
            <span>Quantity: </span> <input type="text" onChange={handleBalancingQuantity} value={balancingQuantity}/>
            <br/>
            <span>Balancing Weights: </span> <input type="text" onChange={handleWeights} value={weights}/>
            <br/>
            <span>Alignment: </span> <input type="text" onChange={handleAlignment} value={alignment}/>
            <br/>
            <br/>
            <span>Total price: {totalPrice}</span>
            <br/>
            <button>Generate invoice </button>
        </div>
    );

}


export default Cart;