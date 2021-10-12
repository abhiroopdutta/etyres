import React, {useContext, useState} from 'react';


// //to-do: date should update real time by chance invoice creation takes place near midnight
// function getCurrentDate(){
//     let today_date = new Date().toISOString().slice(0, 10).split("-");
//     let date = today_date[2]+"-"+today_date[1]+"-"+today_date[0];
//     return date;
//   }
  

function SalesReport(){

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [reportReady, setReportReady] = useState("")

    const handleDateRange = (e) => {
        if(e.target.name === "from"){
            setDateFrom(e.target.value);
        }
        else{
            setDateTo(e.target.value);
        }
    };

    const handleGenerateFile = (e) => {
        e.preventDefault();
		let dateRange = {
            dateFrom: dateFrom,
            dateTo: dateTo
        }       

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dateRange)
          };
        
		fetch(
			"/api/sales_report", requestOptions)
            .then((response) => response.json())
			.then((filename) => {
                fetch('/api/download?name=' + filename, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/vnd.ms-excel',
                    },
                  })
                  .then((response) => response.blob())
                  .then((blob) => {
                    // Create blob link to download
                    const url = window.URL.createObjectURL(
                      new Blob([blob]),
                    );
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute(
                      'download',
                      `sales_report.xls`,
                    );
                
                    // Append to html link element page
                    document.body.appendChild(link);
                
                    // Start download
                    link.click();
                
                    // Clean up and remove the link
                    link.parentNode.removeChild(link);
                  });
			})
			.catch((error) => {
				console.error('Error:', error);
			});
    };


    return(
        <div>
            <h3>select date range - </h3>
            <input type="date" name="from" onChange={handleDateRange}/>
            <input type="date" name="to" onChange={handleDateRange}/>
            <button onClick={handleGenerateFile}> Generate sales report excel </button>
            <h3>{reportReady}</h3>
        </div>
    );
}

export default SalesReport;