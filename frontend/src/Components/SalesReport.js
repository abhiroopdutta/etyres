import React, {useState} from 'react';
import './SalesReport.css'
  
function SalesReport(){

    const [dateRange, setDateRange] = useState({
      saleDateFrom : "",
      purchaseDateFrom : "", 
      stockDateFrom : "",
      saleDateTo : "",
      purchaseDateTo : "",
      stockDateTo : "",
    });

    const reports = ["sale", "purchase", "stock"];

    const handleDateRange = (e, report) => {
      setDateRange({
        ...dateRange,
        [e.target.name]:e.target.value
      });
    };

    const handleGenerateFile = (e) => {
      e.preventDefault();
      let report = e.target.name;
      let reportReqInfo = {
            reportType: report,
            dateFrom: dateRange[report+"DateFrom"],
            dateTo: dateRange[report+"DateTo"]
          }       
      console.log(reportReqInfo);
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportReqInfo)
        };
        
      fetch("/api/sales_report", requestOptions)
      .then((response) => response.json())
      .then((filename) => {
        fetch('/api/download?name=' + filename, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
            report+"_report_"+dateRange[report+"DateFrom"]+"__"+dateRange[report+"DateTo"]+".xlsx",
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
        {reports.map( (report, index) =>
        <div className="report" key={index}>
          <h3>{report} Report - select date -</h3>
          <input type="date" name={report+"DateFrom"} onChange={handleDateRange}/>
          {report!=="stock"?
          <input type="date" name={report+"DateTo"} onChange={handleDateRange}/>
          :null}
          <button name={report} onClick={handleGenerateFile}> Generate {report} report excel </button>
        </div>)}
      </div>  
    );
}

export default SalesReport;