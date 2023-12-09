import "./Invoice.css";
import shopInfo from "../../shopDetails.json";
export default function ShopDetails({ section }) {
    if (section === "header") {
        return (
            <header className="shop-details">
                <h4>{shopInfo.name}</h4>
                <address>
                    {`GSTIN: ${shopInfo.gstInfo.GSTIN},  State: ${shopInfo.gstInfo.state}, Code: ${shopInfo.gstInfo.code}`}
                    <br />
                    {shopInfo.address}
                    <br />
                    {shopInfo.contact}
                </address>
            </header>
        );
    }

    if (section === "footer") {
        return (
            <footer>
                <section>
                    <div className="bank-name">
                        {shopInfo.bank}
                    </div>
                    <div className="signatory-name">For {shopInfo.signatory}</div>
                    <br />
                    <div className="bank-details">
                        {shopInfo.bankIFSC}
                    </div>
                    <div className="signature"></div>
                </section>
                <br />
                <br />
                <section>
                    <div className="eoe">E. &#38; O. E.</div>
                    <div className="signatory">Authorised Signatory</div>
                    <div style={{ clear: "both" }}></div>
                </section>
            </footer>
        );
    }
}
