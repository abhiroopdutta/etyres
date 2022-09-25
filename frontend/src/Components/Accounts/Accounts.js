import React, { useState } from "react";
import { Layout, Typography, Button, Modal } from "antd";
import { Col, Row, Slider } from 'antd';
import { DownloadOutlined } from "@ant-design/icons";
import { dayjsLocal } from "../dayjsUTCLocal";
import HeaderContainer from "./HeaderContainer";
const { Title } = Typography;

function Accounts() {
    const [loading, setLoading] = useState(false);

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
                    <HeaderContainer />
                </Col>
                <Col>

                </Col>
            </Row>


        </Layout>
    );
}

export default Accounts;
