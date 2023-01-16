import "./Invoice.css";

export default function IGSTTable({ data }) {

    return (
        <div className="IGST">
            <table className="IGST-table">
                <thead>
                    <tr>
                        <th className="particulars">Particulars</th>
                        <th className="HSNCode">HSN</th>
                        <th className="Qty">Qty</th>
                        <th className="Rate-per-item">Rate per Item</th>
                        <th className="taxable-value">Taxable value</th>
                        <th>IGST</th>
                        <th className="value">Value</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.products.map((tyre, index) => (
                        <tr key={tyre.itemCode}>
                            <td>{tyre.itemDesc}</td>
                            <td>{tyre.HSN}</td>
                            <td>{tyre.quantity}</td>
                            <td>{tyre.ratePerItem}</td>
                            <td>{tyre.taxableValue}</td>
                            <td className="IGST-cell">
                                {String(tyre.IGSTAmount) +
                                    " (" +
                                    String(Math.round(tyre.IGST * 100)) +
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
                        <td>{data?.total.IGSTAmount}</td>
                        <td>{data?.total.value}</td>
                    </tr>
                </tfoot>
            </table>
            <div className="rounding-table-container">
                <table className="rounding-table">
                    <thead>
                        <tr>
                            <td>Round Off</td>
                            <td>{data?.invoiceRoundOff}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>TOTAL</th>
                            <th>&#x20B9;{data?.invoiceTotal}</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}