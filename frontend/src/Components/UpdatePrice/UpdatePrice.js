import React, { useState, useEffect, useRef } from "react";
import { Table, Layout, Typography, Input, Button, message, Modal } from "antd";
const { Title } = Typography;
const { Content } = Layout;

function UpdatePrice() {
  const [selectedFile, setSelectedFile] = useState();
  const [loading, setLoading] = useState(false);
  const [priceDetails, setPriceDetails] = useState([]);
  const inputFileRef = useRef();

  useEffect(() => {
    async function getPriceDetails() {
      try {
        const response = await fetch("/api/pv_price_details");
        const result = await response.json();
        if (response.ok) {
          setPriceDetails(result);
        }
      } catch (err) {
        Modal.error({
          content: err.message,
        });
        console.log(err.message);
      }
    }
    getPriceDetails();
  }, []);

  function changeHandler(event) {
    setSelectedFile(event.target.files[0]);
  }

  function handleSubmission(e) {
    if (!selectedFile) {
      message.error("No file selected", 2);
      return;
    }
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("priceDetails", JSON.stringify(priceDetails));

    fetch("/api/update_price", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        inputFileRef.current.value = "";
        setSelectedFile(null);
        Modal.success({
          content: result,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handlePriceDetailChange(e, index) {
    setPriceDetails((prevState) => {
      let prevStateCopy = [...prevState];
      prevStateCopy[index] = {
        ...prevStateCopy[index],
        [e.target.name]: e.target.value,
      };
      return prevStateCopy;
    });
  }
  const columns = [
    {
      title: "Category",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "SPD",
      dataIndex: "spd",
      key: "spd",
      render: (column_value, column, index) => (
        <Input
          value={priceDetails[index].spd}
          name="spd"
          style={{ marginBottom: 8, display: "block", width: 60 }}
          onChange={(e) => handlePriceDetailChange(e, index)}
          disabled={loading}
        />
      ),
    },
    {
      title: "PLSD",
      dataIndex: "plsd",
      key: "plsd",
      render: (column_value, column, index) => (
        <Input
          value={priceDetails[index].plsd}
          name="plsd"
          style={{ marginBottom: 8, display: "block", width: 60 }}
          onChange={(e) => handlePriceDetailChange(e, index)}
          disabled={loading}
        />
      ),
    },
    {
      title: "Tyre Freight",
      dataIndex: "tyreFreight",
      key: "tyreFreight",
      render: (column_value, column, index) => (
        <Input
          value={priceDetails[index].tyreFreight}
          name="tyreFreight"
          style={{ marginBottom: 8, display: "block", width: 60 }}
          onChange={(e) => handlePriceDetailChange(e, index)}
          disabled={loading}
        />
      ),
    },
    {
      title: "Tube Freight",
      dataIndex: "tubeFreight",
      key: "tubeFreight",
      render: (column_value, column, index) => (
        <Input
          value={priceDetails[index].tubeFreight}
          name="tubeFreight"
          style={{ marginBottom: 8, display: "block", width: 60 }}
          onChange={(e) => handlePriceDetailChange(e, index)}
          disabled={loading}
        />
      ),
    },
  ];

  return (
    <Layout
      style={{
        background: "var(--global-app-color)",
        maxWidth: "40%",
        margin: "22px 44px",
      }}
    >
      <Title level={4}>
        Upload price list xlsx to update price or add new items in inventory
      </Title>
      <Content>
        <Table
          style={{
            marginBottom: "40px",
          }}
          columns={columns}
          dataSource={priceDetails}
          pagination={false}
          rowKey={(item) => item.vehicleType}
        ></Table>
        <label
          htmlFor="price-list-upload"
          className={loading ? "upload-button disabled" : "upload-button"}
        >
          Choose file
        </label>
        <input
          ref={inputFileRef}
          disabled={loading}
          type="file"
          onChange={changeHandler}
          id="price-list-upload"
          className="price-list-upload-input"
        />
        <span style={{ margin: "10px" }}>{selectedFile?.name}</span>
        <br />
        <br />
        <Button loading={loading} onClick={handleSubmission} type="primary">
          Submit
        </Button>
      </Content>
    </Layout>
  );
}

export default UpdatePrice;
