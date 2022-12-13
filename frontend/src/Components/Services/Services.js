import React from "react";
import ServicesForm from "./ServicesForm";
import { Layout, Col, Row } from "antd";

function Services() {

    return (
        <Layout
            style={{
                maxWidth: "95%",
                margin: "44px auto ",
            }}
        >
            <Row gutter={30}>
                <Col lg={7}>
                    <ServicesForm />
                </Col>
                <Col flex={"auto"}>

                </Col>
            </Row>

        </Layout>
    );
}

export default Services;
