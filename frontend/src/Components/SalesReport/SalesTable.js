import React, { useEffect, useState } from "react";
import { useTable, useSortBy } from "react-table";
import dayjs from "dayjs";

function SalesTable() {
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [query, setQuery] = useState({});

  useEffect(() => {
    const getSalesInvoices = async () => {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      };
      try {
        const response = await fetch("/api/sales_invoices", requestOptions);
        const result = await response.json();
        if (response.ok) {
          result.data.forEach((invoice) => {
            invoice.invoiceDate = dayjs(invoice.invoiceDate["$date"]).format(
              "DD/MM/YYYY"
            );
          });
          console.log("use effect");
          setSalesInvoices(result.data);
          setQuery(result.query);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      }
    };
    getSalesInvoices();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Invoice No.",
      },
      {
        Header: "Invoice Date",
      },
      {
        Header: "Invoice Total",
      },
      {
        Header: "Customer Name",
      },
    ],
    []
  );

  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.Header}>{column.Header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {salesInvoices.map((invoice) => (
            <tr key={invoice.invoiceNumber}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.invoiceDate}</td>
              <td>{invoice.invoiceTotal}</td>
              <td>{invoice.customerDetails.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <p>
          Showing {query.pagination.pageSize} of {query.pagination.totalResults}{" "}
          results
        </p>
        <button>Prev</button>
        <button>Next</button>
        <h4>Page {query.pagination.pageNumber}</h4>
      </div>
    </div>
  );
}

export default SalesTable;
