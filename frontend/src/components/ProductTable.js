/* Final complete updated ProductTable.js with full dark/light theme support */

import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Form, Input, Upload, message, Spin, Checkbox, Switch } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BulbOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import './ProductTable.css';

const { TextArea } = Input;

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [photo, setPhoto] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    form.resetFields();
    setSpecs([]);
    setFileList([]);
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (record) => {
    form.setFieldsValue(record);
    setSpecs(record.specs || []);
    setFileList(
      record.imageUrl
        ? [{
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: record.imageUrl
          }]
        : []
    );
    setEditingProduct(record);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          message.success('Product deleted successfully');
          fetchProducts();
        } catch (error) {
          console.error(error);
          message.error('Failed to delete product');
        }
      },
    });
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async file => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new window.Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleAddSpecRow = () => {
    setSpecs([
      ...specs,
      {
        key: Date.now(),
        label: '',
        value: '',
      },
    ]);
  };

  const handleRemoveSpecRow = (index) => {
    const updated = [...specs];
    updated.splice(index, 1);
    setSpecs(updated);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Filter out incomplete spec rows
      const finalSpecs = specs.filter(spec => spec.label.trim() && spec.value.trim());
      
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', values.price);
      formData.append('description', values.description);
      // Convert specs array to string for FormData
      formData.append('specs', JSON.stringify(finalSpecs));
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('photo', fileList[0].originFileObj);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData, config);
        message.success('Product updated successfully');
      } else {
        await axios.post('/api/products/upload', formData, config);
        message.success('Product added successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Failed to save product');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) =>
        text ? <img src={text} alt="product" style={{ width: 80, height: 80, objectFit: 'cover' }} /> : 'No Image',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span>{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>,
    },
    {
      title: 'Specifications',
      dataIndex: 'specs',
      key: 'specs',
      render: (specs) => (
        <ul style={{ paddingLeft: '20px' }}>
          {specs?.map((spec, index) => (
            <li key={index}>{`${spec.label}: ${spec.value}`}</li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditProduct(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteProduct(record._id)} />
        </>
      ),
    },
  ];

  return (
    <div className={darkMode ? 'dark-mode product-table-container' : 'light-mode product-table-container'}>
      <div className="theme-toggle">
        <BulbOutlined style={{ marginRight: 8 }} />
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      </div>

      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: '16px' }} onClick={handleAddProduct}>
        Add Product
      </Button>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page) => setCurrentPage(page),
          }}
          className={darkMode ? 'dark-table' : 'light-table'}
        />
      )}

      <Modal
        open={modalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        okText={editingProduct ? 'Update' : 'Add'}
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleFormSubmit}
        destroyOnClose
        width={1000}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Product Price">
            <Input type="number" placeholder="Enter price" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Product Image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              onPreview={handlePreview}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="Product Specifications">
            <div className="spec-container p-3 rounded" style={{ 
              background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
              border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div className="spec-header d-flex align-items-center justify-content-between mb-3">
                <h6 className="m-0">Product Specifications</h6>
                <Button 
                  type="primary"
                  onClick={handleAddSpecRow}
                  icon={<PlusOutlined />}
                  style={{
                    background: darkMode ? '#1890ff' : '#40a9ff',
                    borderColor: darkMode ? '#1890ff' : '#40a9ff'
                  }}
                >
                  Add Specification
                </Button>
              </div>
              
              <div className="spec-table">
                {specs.map((spec, idx) => (
                  <div 
                    className="spec-row d-flex align-items-center gap-2 mb-3 p-2 rounded" 
                    key={spec.key || idx}
                    style={{
                      background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${darkMode ? '#333' : '#eee'}`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="spec-number" style={{ 
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: darkMode ? '#1f1f1f' : '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      color: darkMode ? '#fff' : '#666'
                    }}>
                      {idx + 1}
                    </div>
                    <Input
                      placeholder="Specification (e.g. Size, Weight)"
                      value={spec.label}
                      onChange={e => handleSpecChange(idx, 'label', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Input
                      placeholder="Value (e.g. 10cm, 2kg)"
                      value={spec.value}
                      onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveSpecRow(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        padding: 0
                      }}
                    />
                  </div>
                ))}
                
                {specs.length === 0 && (
                  <div 
                    className="text-center p-4 rounded"
                    style={{
                      background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                      border: `1px dashed ${darkMode ? '#444' : '#ddd'}`,
                      color: darkMode ? '#888' : '#666'
                    }}
                  >
                    No specifications added yet. Click "Add Specification" to start adding product details.
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTable;
