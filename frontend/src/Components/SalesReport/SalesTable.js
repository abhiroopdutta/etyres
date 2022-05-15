import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";

function SalesTable() {
  const [query, setQuery] = useState({});
  const [pageRequest, setPageRequest] = useState(1);
  const [maxItemsPerPage, setMaxItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [salesInvoices, setSalesInvoices] = useState([]);

  const getTableData = useCallback(
    async (query, pageRequest, maxItemsPerPage) => {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          pageRequest: pageRequest,
          maxItemsPerPage: maxItemsPerPage,
        }),
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
          setSalesInvoices(result.data);
          setCurrentPage(result.pagination);
        }
      } catch (err) {
        alert(err.message);
        console.log(err.message);
      }
    },
    []
  );

  useEffect(() => {
    getTableData(query, pageRequest, maxItemsPerPage);
    console.log("fetch");
  }, [query, pageRequest, maxItemsPerPage]);

  const handlePageChange = (e) => {
    if (e.target.id == "prev" && currentPage.pageNumber > 1) {
      setPageRequest((pageRequest) => pageRequest - 1);
    } else if (
      e.target.id == "next" &&
      currentPage.pageNumber * maxItemsPerPage < currentPage.totalResults
    ) {
      setPageRequest((pageRequest) => pageRequest + 1);
    }
  };
  console.log(pageRequest);
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
          Showing{" "}
          {currentPage?.pageSize +
            (currentPage?.pageNumber - 1) * maxItemsPerPage}{" "}
          of {currentPage?.totalResults} results
        </p>
        <button id="prev" onClick={handlePageChange}>
          Prev
        </button>
        <button id="next" onClick={handlePageChange}>
          Next
        </button>
        <h4>Page {currentPage?.pageNumber}</h4>
      </div>
    </div>
  );
}

export default SalesTable;
