import React, { useState } from "react";
import "./SalesReport.css";
import SalesTable from "./SalesTable";

function SalesReport() {
  const [stockResetMsg, setStockResetStatus] = useState(false);

  const [toggleLoader, setToggleLoader] = useState(false);

  const handleGenerateFile = (reportType, filters) => {
    let reportReqInfo = {
      reportType: reportType,
      filters: filters,
    };
    console.log(reportReqInfo);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportReqInfo),
    };

    fetch("/api/sales_report", requestOptions)
      .then((response) => response.json())
      .then((filename) => {
        fetch("/api/download?name=" + filename, {
          method: "GET",
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              reportType +
                "_report_" +
                filters.invoiceDate.start +
                "__" +
                filters.invoiceDate.end +
                ".xlsx"
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
        console.error("Error:", error);
      });
  };

  const handleResetStock = () => {
    if (
      window.confirm(
        "This will overwride all manual stock modifications to products table \n Do you want to proceed?"
      )
    ) {
      setToggleLoader(true);
      fetch("/api/reset_stock")
        .then((res) => res.json())
        .then((data) => {
          setToggleLoader(false);
          setStockResetStatus(data);
        });
    } else {
      console.log("cancelled");
    }
  };

  return (
    <div>
      <div className="excel-report">
        <button className="reset-button" onClick={handleResetStock}>
          {" "}
          Reset Stock{" "}
        </button>
        {stockResetMsg ? (
          <h4 className="reset-button">Stock has been reset</h4>
        ) : null}
        {toggleLoader ? (
          <div class="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : null}
      </div>
      <div className="sales-table">
        <SalesTable exportToExcel={handleGenerateFile} />
      </div>
    </div>
  );
}

export default SalesReport;
