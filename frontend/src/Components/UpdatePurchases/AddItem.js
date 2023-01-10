import React from "react";
import { message, Button, Modal, Form, Input, Layout, Select } from "antd";
import { useCreateProduct } from "../../api/product";
const { Option } = Select;

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function AddItem({
  visible,
  invoiceNumber,
  item,
  toggleModal,
  dispatchInvoicesWithNewItems,
}) {
  const { mutate: createProduct, isLoading: isLoadingCreateProduct } = useCreateProduct({
    onSuccess: () => {
      toggleModal(false);
      setTimeout(
        () => message.success("Item added to inventory!", 2),
        700
      );
      setTimeout(() => {
        dispatchInvoicesWithNewItems({
          type: "UPDATE_ITEM_STATUS",
          invoiceNumber: invoiceNumber,
          itemCode: item.item_code,
        });
      }, 1100);
    }
  });
  const handleCloseModal = () => {
    toggleModal(false);
  };

  const handleAddtoInventory = (formData) => {
    let newItem = {
      vehicle_type: formData.vehicleType,
      item_desc: formData.itemDesc,
      item_code: formData.itemCode,
      cost_price: formData.costPrice,
    };
    createProduct(newItem);
  };

  return (
    <Modal
      visible={visible}
      centered
      destroyOnClose
      footer={null}
      title="Add item to inventory"
      onCancel={handleCloseModal}
    >
      <Layout
        style={{
          margin: "15px auto 0 auto",
        }}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          labelAlign="left"
          onFinish={handleAddtoInventory}
          autoComplete="off"
          initialValues={{
            remember: false,
            itemDesc: item?.item_desc,
            itemCode: item?.item_code,
            costPrice: roundToTwo(item?.item_total / item?.quantity),
            vehicleType: "passenger car",
          }}
        >

          <Form.Item
            label="Item Desc"
            name="itemDesc"
          >
            <Input
              disabled
            />
          </Form.Item>
          <Form.Item
            label="Item Code"
            name="itemCode"
          >
            <Input
              disabled
            />
          </Form.Item>
          <Form.Item
            label="Vehicle Type"
            name="vehicleType"
            rules={[{ required: true, message: 'Please input vehicleType!' }]}
          >
            <Select >
              <Option value="passenger car">PCR</Option>
              <Option value="2 wheeler">2 Wheeler</Option>
              <Option value="3 wheeler">3 Wheeler</Option>
              <Option value="scv">SCV</Option>
              <Option value="tubeless valve">Tubeless Valve</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Cost Price"
            name="costPrice"
            rules={[{ required: true, message: 'Please input cost price!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{
            margin: "0",
          }}>
            <Button
              loading={isLoadingCreateProduct}
              type="primary"
              htmlType="submit"
            >
              Add to Inventory
            </Button>
          </Form.Item>

        </Form>

      </Layout>
    </Modal>
  );
}

export default AddItem;
