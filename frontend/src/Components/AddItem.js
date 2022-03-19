import './AddItem.css';

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function AddItem({item, toggleModal}){

    const handleCloseModal = () => {
        toggleModal(false);
    }

    return (
        <div className="add-item-modal">
            <div className="add-item-modal-content">
                <header className="add-item-child">
                    <strong>Add Item to inventory</strong>
                    <button onClick={handleCloseModal}>X</button>
                </header>    

                <section className="add-item-child">
                    <h4>{item.item_desc}</h4>
                    <h4>{item.item_code}</h4>
                    <label htmlFor="cost-price">Cost Price:</label>
                    <input type="text" id="cost-price" name="cost-price" value={roundToTwo(item.item_total/item.quantity)}/>
                      <label for="vehicle-category">Category</label>
                        <select name="vehicle-category">
                          <option value="passenger car">PCR</option>
                          <option value="2 wheeler">2 Wheeler</option>
                          <option value="3 wheeler">3 Wheeler</option>
                          <option value="scv">SCV</option>
                          <option value="tubeless valve">Tubeless Valve</option>
                        </select>
                    
                </section>

                <footer className="add-item-child">
                    <button>Add to inventory</button>
                </footer>
            </div>

        </div>
    );
}

export default AddItem;