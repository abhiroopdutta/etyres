import React, {useState} from 'react';

function UpdatePrice() {

    const [selectedFile, setSelectedFile] = useState();
    const [successMsg, setSuccessMsg] = useState("");

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);

	};

    const handleSubmission = (e) => {
        e.preventDefault();
		const formData = new FormData();
		formData.append('file', selectedFile);

		fetch(
			'/update_price',
			{
				method: 'POST',
				body: formData,
			}
            )
            .then((response) => response.json())
			.then((result) => {
                setSuccessMsg(result);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            


	};

    return (
        <div>
            <h3>Upload price list xlsx to update price or add new items in inventory</h3>
            <form method="POST" action="" encType="multipart/form-data" >
            <p><input type="file" name="file" onChange={changeHandler}/></p>
            <p><input type="submit" value="Submit" onClick={handleSubmission}/></p>
            <p>{successMsg}</p>
            </form>
        </div>
        
    );
}

export default UpdatePrice;