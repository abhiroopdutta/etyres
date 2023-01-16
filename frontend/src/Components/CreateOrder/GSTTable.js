import "./Invoice.css";

export default function GSTTable({ data }) {

    return (
        <div className="GST">
            <table className="GST-table">
                <thead>
                    <tr>
                        <th className="particulars">Particulars</th>
                        <th className="HSNCode">HSN</th>
                        <th className="Qty">Qty</th>
                        <th className="Rate-per-item">Rate per Item</th>
                        <th className="taxable-value">Taxable value</th>
                        <th>CGST</th>
                        <th>SGST</th>
                        <th className="value">Value</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.products.map((tyre) => (
                        <tr key={tyre.itemCode}>
                            <td>{tyre.itemDesc}</td>
                            <td>{tyre.HSN}</td>
                            <td>{tyre.quantity}</td>
                            <td>{tyre.ratePerItem}</td>
                            <td>{tyre.taxableValue}</td>
                            <td>
                                {String(tyre.CGSTAmount) +
                                    " (" +
                                    String(Math.round(tyre.CGST * 100)) +
                                    "%)"}
                            </td>
                            <td>
                                {String(tyre.SGSTAmount) +
                                    " (" +
                                    String(Math.round(tyre.SGST * 100)) +
                                    "%)"}
                            </td>
                            <td>{tyre.value}</td>
                        </tr>
                    ))}

                </tbody>

                <tfoot>
                    <tr>
                        <th>Net Amount</th>
                        <td>-</td>
                        <td>{data?.total.quantity}</td>
                        <td>-</td>
                        <td>{data?.total.taxableValue}</td>
                        <td>{data?.total.CGSTAmount}</td>
                        <td>{data?.total.SGSTAmount}</td>
                        <td>{data?.total.value}</td>
                    </tr>
                </tfoot>
            </table>
            <div className="rounding-table-container">
                <table className="rounding-table">
                    <thead>
                        <tr>
                            <td>Round off</td>
                            <td>{data?.invoiceRoundOff}</td>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <th>TOTAL</th>
                            <th>&#x20B9; {data?.invoiceTotal}</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
} 