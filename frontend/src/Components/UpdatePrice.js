import React, {useContext, useState} from 'react';

function UpdatePrice() {

    const [selectedFile, setSelectedFile] = useState();
    const [isSelected, setIsSelected] = useState();

	const changeHandler = (event) => {

		setSelectedFile(event.target.files[0]);
		setIsSelected(true);

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
				console.log('Success:', result);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            


	};

    return (
        // <div>
        //     <input type="file" name="file" onChange={changeHandler} />

        //     {isSelected 
        //     ? 
        //     <div>
        //         <p>Filename: {selectedFile.name}</p>
        //         <p>Size in bytes: {selectedFile.size}</p>
        //     </div>

        //     : 
        //     <p>Select a file to show details</p>
        //     }
        //     <button onClick={handleSubmission}>Submit</button>    
        // </div>
        <div>
            <h1>File Upload</h1>
            <form method="POST" action="" encType="multipart/form-data" >
            <p><input type="file" name="file" onChange={changeHandler}/></p>
            <p><input type="submit" value="Submit" onClick={handleSubmission}/></p>
            </form>
        </div>
        
    );
}

export default UpdatePrice;