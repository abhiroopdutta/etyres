import React, { useState } from "react";
import { Layout, Typography, Button, Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import SalesTable from "./SalesTable";
import PurchaseTable from "./PurchaseTable";
import { dayjsLocal } from "../dayjsUTCLocal";
const { Title } = Typography;

function Reports() {
  const [loading, setLoading] = useState(false);

  const handleGenerateFile = (reportReqInfo) => {
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
            let fileName = "";
            if (reportReqInfo.reportType === "stock") {
              fileName = `stock_report_${dayjsLocal(new Date()).format("YYYY-MM-DD")}.xlsx`;
            }
            else {
              let start_date_string = reportReqInfo.query.invoiceDateFrom;
              let end_date_string = reportReqInfo.query.invoiceDateTo;

              if (reportReqInfo.exportType === "gstr1") {
                fileName = `GSTR1_${start_date_string}__${end_date_string}.xlsx`;
              }
              else {
                fileName = `${reportReqInfo.reportType}_${start_date_string}__${end_date_string}.xlsx`;
              }
            }

            link.setAttribute("download", fileName);

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
        background: "var(--global-app-color)",
        maxWidth: "90%",
        margin: "44px auto",
      }}
    >
      <div className="sales-table">
        <SalesTable exportToExcel={handleGenerateFile} />
      </div>
      <br />
      <br />

      <div className="purchase-table">
        <PurchaseTable exportToExcel={handleGenerateFile} />
      </div>
      <br />

      <div className="stock-report">
        <Title level={3}>Stock</Title>
        <Button
          icon={<DownloadOutlined />}
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
      <br />

      <div className="reset-stock">
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
