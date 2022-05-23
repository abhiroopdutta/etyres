import React, { useState } from "react";
import { Layout, Typography, Button, Divider, Modal } from "antd";
import dayjs from "dayjs";
import SalesTable from "./SalesTable";
import PurchaseTable from "./PurchaseTable";
const { Title } = Typography;

function Reports() {
  const [loading, setLoading] = useState(false);

  const handleGenerateFile = (reportReqInfo) => {
    console.log(reportReqInfo);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportReqInfo),
    };

    fetch("/api/reports", requestOptions)
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
            if (reportReqInfo.reportType == "stock") {
              link.setAttribute(
                "download",
                reportReqInfo.reportType +
                  "_report_" +
                  dayjs().format("YYYY-MM-DD") +
                  ".xlsx"
              );
            } else {
              link.setAttribute(
                "download",
                reportReqInfo.reportType +
                  "_report_" +
                  reportReqInfo.filters.invoiceDate.start +
                  "__" +
                  reportReqInfo.filters.invoiceDate.end +
                  ".xlsx"
              );
            }

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
      setLoading(true);
      fetch("/api/reset_stock")
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data) {
            Modal.success({
              content: "Stock was reset successfully",
            });
          } else {
            Modal.error({
              content: "Stock could not be reset",
            });
          }
        });
    } else {
      console.log("cancelled");
    }
  };

  return (
    <Layout
      style={{
        background: "rgba(256, 256, 256)",
        maxWidth: "90%",
        margin: "44px auto",
      }}
    >
      <div className="sales-table">
        <SalesTable exportToExcel={handleGenerateFile} />
      </div>
      <Divider />
      <div className="purchase-table">
        <PurchaseTable exportToExcel={handleGenerateFile} />
      </div>
      <Divider />

      <div className="stock-report">
        <Title level={3}>Stock</Title>
        <Button
          onClick={() => {
            handleGenerateFile({
              reportType: "stock",
              filters: {},
              sorters: {},
              pageRequest: {},
              maxItemsPerPage: {},
              export: true,
            });
          }}
        >
          Export Current Stock Report
        </Button>
      </div>
      <Divider />

      <div className="excel-report">
        <br />
        <Button
          loading={loading}
          style={{ marginBottom: "40px" }}
          onClick={handleResetStock}
        >
          Reset Stock
        </Button>
      </div>
    </Layout>
  );
}

export default Reports;
