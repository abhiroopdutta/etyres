import React, { useState, useEffect } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { dayjsLocal } from "../dayjsUTCLocal";
import HeaderContainer from "./HeaderContainer";
const { Title } = Typography;

function Accounts() {
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [headersUpdated, setHeadersUpdated] = useState(false);
    useEffect(() => {
        let didCancel = false; // avoid fetch race conditions or set state on unmounted components
        async function fetchHeaders() {

            const requestOptions = {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            };
            try {
                const response = await fetch("/api/get_headers", requestOptions);
                const result = await response.json();
                if (response.ok && !didCancel) {
                    setHeaders(result);
                }
            } catch (err) {
                if (!didCancel) {
                    Modal.error({
                        content: err.message,
                    });
                    console.log(err.message);
                }
            }
        }
        fetchHeaders();
        return () => {
            didCancel = true;
        };
    }, [headersUpdated]);

    return (
        <Layout
            style={{
                background: "var(--global-app-color)",
                maxWidth: "95%",
                margin: "44px auto",
            }}
        >
            <Row justify={"center"}>
                <Col>
                    <Button
                        loading={loading}
                        style={{ marginBottom: "40px" }}
                    >
                        Add new transaction
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <HeaderContainer headers={headers} setHeadersUpdated={setHeadersUpdated} />
                </Col>
                <Col>

                </Col>
            </Row>


        </Layout>
    );
}

export default Accounts;
