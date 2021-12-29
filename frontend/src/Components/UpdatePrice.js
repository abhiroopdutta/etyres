import React, {useState} from 'react';
import './UpdatePrice.css'

function UpdatePrice() {

    const [selectedFile, setSelectedFile] = useState();
    const [successMsg, setSuccessMsg] = useState("");
    const [toggleLoader, setToggleLoader] = useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
	};

    const handleSubmission = (e) => {
        e.preventDefault();
        setToggleLoader(true);
		const formData = new FormData();
		formData.append('file', selectedFile);

		fetch(
			'/api/update_price',
			{
				method: 'POST',
				body: formData,
			}
            )
            .then((response) => response.json())
			.then((result) => {
                setSuccessMsg(result);
                setToggleLoader(false);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            


	};

    return (
        <div className="update-price">
            <h3>Upload price list xlsx to update price or add new items in inventory</h3>
            <form method="POST" action="" encType="multipart/form-data" >
            <p><input type="file" name="file" onChange={changeHandler}/></p>
            <p><input type="submit" value="Submit" onClick={handleSubmission}/></p>
            <p>{successMsg}</p>
            {toggleLoader?
            <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            :null}
            </form>
        </div>
        
    );
}

export default UpdatePrice;