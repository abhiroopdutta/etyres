import React, {useContext, useState} from 'react';
import { CartContext } from './CartContext';
import CartTyre from './CartTyre';
import './Cart.css';
import { Link } from 'react-router-dom';

function Cart(){

    
    const {tyresContext, servicesContext} = useContext(CartContext);
    // eslint-disable-next-line 
    const [cart, setCart] = tyresContext;
    // eslint-disable-next-line
    const [services, setServices] = servicesContext;

    const [servicesLocal, setServicesLocal] = useState([
        {name:"Fitting", price:50, quantity:0}, 
        {name:"Valves", price:50, quantity:0}, 
        {name:"Balancing", price:50, quantity:0},
        {name:"Weights", price:0, quantity:0},
        {name:"Alignment", price:0, quantity:0}])

    const handleServicesPrice = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...servicesLocal];
        servicesCopy[index].price = e.target.value;
        setServicesLocal(servicesCopy);
        console.log(e.target.value)        
    }; 

    const handleServicesQuantity = (index, e) =>{
        e.preventDefault(); //why use this
        let servicesCopy = [...servicesLocal];
        servicesCopy[index].quantity = e.target.value;
        setServicesLocal(servicesCopy);        
    }; 

    const handleFocus = (e) => e.target.select();

    const handleInvoice = () =>{
        setServices(servicesLocal);
    }

    let tyresPrice = 0;
    for(let i=0; i<cart.length; i++){
        tyresPrice = tyresPrice+cart[i].price*cart[i].quantity;
    }  

    let servicesPrice=0;
    for(let i=0; i<servicesLocal.length; i++){
        servicesPrice = servicesPrice+servicesLocal[i].price*servicesLocal[i].quantity;
    }

    let totalPrice = tyresPrice+servicesPrice;


    return(
        <div className="cart"> 

            <div className="cart-title">CART SUMMARY</div>
            <Link className="invoice-button" onClick={handleInvoice} to="/invoice">Preview invoice</Link>
            
            
            {cart.map( (tyre, index)=> <CartTyre tyreData={tyre} key={index}/> )}  

            <div className="service"> 
                {servicesLocal.map( (service, index)=>
                <div key={index}>
                    <div className="service-name">{service.name}:</div> 

                        <span className="service-price">
                            <span>Price: </span>
                            <input type="text" value={service.price} onChange={(e)=>handleServicesPrice(index,e)} onFocus={handleFocus}/>
                        </span>

                        <span className="service-quantity">
                            <span>Quantity: </span>
                            <input type="number" step="1" min="0" value={service.quantity} onChange={(e)=>handleServicesQuantity(index,e)} onFocus={handleFocus}/>
                        </span>                    
                </div>
                )}
            </div>
            
            
            <div className="total-price">Total price: &#x20B9;{totalPrice}</div>
            <br/>
             
        </div>
    );

}


export default Cart;