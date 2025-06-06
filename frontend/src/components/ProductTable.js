"use client"

import { useState, useEffect } from "react"
import { Table, Modal, Button, Form, Input, Upload, message, Spin } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileImageOutlined,
  TagsOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons"
import axios from "axios"
import "./ProductTable.css"

const { TextArea } = Input

const ProductTable = ({ products: propProducts, theme }) => {
  const [products, setProducts] = useState(propProducts || [])

  // Update products when props change
  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts)
    }
  }, [propProducts])

  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [specs, setSpecs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(4)
  const [searchText, setSearchText] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  // Use theme from props instead of local state
  const isDarkMode = theme === "dark"

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await axios.get("/api/products", { headers })
      console.log("Fetched products:", response.data)
      setProducts(response.data)
    } catch (error) {
      console.error("Fetch products error:", error)
      if (error.response) {
        message.error(`Failed to fetch products: ${error.response.data.message || error.response.statusText}`)
      } else {
        message.error("Failed to fetch products: Network error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    form.resetFields()
    setSpecs([])
    setFileList([])
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleEditProduct = (record) => {
    // Handle multilingual fields from backend
    const formValues = {
      name: record.name?.en || record.name,
      description: record.description?.en || record.description,
      price: record.price,
    }

    form.setFieldsValue(formValues)

    // Handle specs - extract English values or fallback to direct values
    const editSpecs = (record.specs || []).map((spec, index) => ({
      key: Date.now() + index,
      label: spec.label?.en || spec.label,
      value: spec.value?.en || spec.value,
    }))

    setSpecs(editSpecs)

    setFileList(
      record.imageUrl
        ? [
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: record.imageUrl,
            },
          ]
        : [],
    )
    setEditingProduct(record)
    setModalOpen(true)
  }

  const handleDeleteProduct = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
      okText: "Yes",
      cancelText: "No",
      okButtonProps: {
        className: "delete-confirm-btn",
      },
      cancelButtonProps: {
        className: "delete-cancel-btn",
      },
      onOk: async () => {
        try {
          await axios.delete(`/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          message.success("Product deleted successfully")
          fetchProducts()
        } catch (error) {
          console.error(error)
          message.error("Failed to delete product")
        }
      },
    })
  }

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handlePreview = async (file) => {
    let src = file.url
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj)
        reader.onload = () => resolve(reader.result)
      })
    }
    const image = new window.Image()
    image.src = src
    const imgWindow = window.open(src)
    imgWindow?.document.write(image.outerHTML)
  }

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs]
    updated[index][field] = value
    setSpecs(updated)
  }

  const handleAddSpecRow = () => {
    setSpecs([
      ...specs,
      {
        key: Date.now(),
        label: "",
        value: "",
      },
    ])
  }

  const handleRemoveSpecRow = (index) => {
    const updated = [...specs]
    updated.splice(index, 1)
    setSpecs(updated)
  }

  const handleFormSubmit = async () => {
    try {
      setSubmitLoading(true)
      const values = await form.validateFields()
      console.log("Form values:", values)

      // Validate required fields
      if (!values.name || !values.name.trim()) {
        message.error("Product name is required")
        return
      }

      if (!values.description || !values.description.trim()) {
        message.error("Product description is required")
        return
      }

      if (!values.price || values.price <= 0) {
        message.error("Valid product price is required")
        return
      }

      // Filter out incomplete spec rows and format them for the backend
      const finalSpecs = specs
        .filter((spec) => spec.label && spec.label.trim() && spec.value && spec.value.trim())
        .map((spec) => ({
          label: {
            en: spec.label.trim(),
          },
          value: {
            en: spec.value.trim(),
          },
        }))

      console.log("Final specs:", finalSpecs)

      const formData = new FormData()

      // Use simple field names first, then add multilingual support
      formData.append("name", values.name.trim())
      formData.append("description", values.description.trim())
      formData.append("price", Number.parseFloat(values.price).toString())

      // Also append multilingual format for backward compatibility
      formData.append("name[en]", values.name.trim())
      formData.append("description[en]", values.description.trim())
      formData.append("nameEn", values.name.trim())
      formData.append("descriptionEn", values.description.trim())

      // Always append specs (empty array if none)
      formData.append("specs", JSON.stringify(finalSpecs))

      // Handle image upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("photo", fileList[0].originFileObj)
        // formData.append("image", fileList[0].originFileObj) // Add alternative field name
      }

      // Debug: Log FormData contents
      console.log("=== FormData Contents ===")
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
      }

      const token = localStorage.getItem("token")
      if (!token) {
        message.error("Authentication token not found. Please login again.")
        return
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      }

      let response
      if (editingProduct) {
        console.log("Updating product:", editingProduct._id)
        response = await axios.put(`/api/products/${editingProduct._id}`, formData, config)
        message.success("Product updated successfully")
      } else {
        console.log("Creating new product with endpoint: /api/products/upload")
        // Try both endpoints if needed
        try {
          response = await axios.post("/api/products/upload", formData, config)
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Trying alternative endpoint: /api/products")
            response = await axios.post("/api/products", formData, config)
          } else {
            throw error
          }
        }
        message.success("Product added successfully")
      }

      console.log("API Response:", response.data)
      setModalOpen(false)
      fetchProducts()
    } catch (error) {
      console.error("=== Form submission error ===", error)

      if (error.response) {
        console.error("Server Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        })

        let errorMessage = "Failed to save product"

        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data
          }

          if (error.response.data.details) {
            console.error("Validation errors:", error.response.data.details)
            errorMessage += ". Check console for validation details."
          }
        }

        message.error(errorMessage)
      } else if (error.request) {
        console.error("Network Error - No response received:", error.request)
        message.error("Network error: No response from server. Please check your connection.")
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timeout:", error.message)
        message.error("Request timeout: Server took too long to respond.")
      } else {
        console.error("Unexpected error:", error.message)
        message.error(`Unexpected error: ${error.message}`)
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  // Filter products based on search text
  const filteredProducts = products.filter((product) => {
    const name = product.name?.en || product.name || ""
    const description = product.description?.en || product.description || ""
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      description.toLowerCase().includes(searchText.toLowerCase())
    )
  })

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (text) =>
        text ? (
          <div className="product-image-container">
            <img src={text || "/placeholder.svg"} alt="product" className="product-image" />
          </div>
        ) : (
          <div className="no-image">
            <FileImageOutlined />
            <span>No Image</span>
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <div className="product-name">{text?.en || text}</div>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => <div className="product-price">₹{text}</div>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => {
        const description = text?.en || text
        return (
          <div className="product-description">
            {description && description.length > 50 ? description.substring(0, 50) + "..." : description}
          </div>
        )
      },
    },
    {
      title: "Specifications",
      dataIndex: "specs",
      key: "specs",
      render: (specs) => (
        <div className="specs-list">
          {specs && specs.length > 0 ? (
            <ul>
              {specs.slice(0, 2).map((spec, index) => {
                const label = spec.label?.en || spec.label
                const value = spec.value?.en || spec.value
                return <li key={index}>{`${label}: ${value}`}</li>
              })}
              {specs.length > 2 && <li className="more-specs">+{specs.length - 2} more</li>}
            </ul>
          ) : (
            <span className="no-specs">No specifications</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button icon={<EditOutlined />} className="edit-button" onClick={() => handleEditProduct(record)} />
          <Button icon={<DeleteOutlined />} className="delete-button" onClick={() => handleDeleteProduct(record._id)} />
        </div>
      ),
    },
  ]

  return (
    <div className={(isDarkMode ? "ptable-dark-mode" : "ptable-light-mode") + " ptable-container"}>
      <div className="ptable-header">
        <div className="ptable-header-left">
          <h2 className="ptable-title">Product Management</h2>
          <div className="ptable-search-container">
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="ptable-search-input"
            />
          </div>
        </div>

        <div className="ptable-header-right">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct} className="ptable-add-product-btn">
            Add Product
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="ptable-loading-container">
          <Spin size="large" />
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="ptable-table-container">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              className: "ptable-custom-pagination",
            }}
            className={isDarkMode ? "ptable-dark-table" : "ptable-light-table"}
            rowClassName="ptable-row"
          />
        </div>
      )}

      <Modal
        open={modalOpen}
        title={
          <div className="ptable-modal-title">
            {editingProduct ? (
              <>
                <EditOutlined className="ptable-modal-icon" /> Edit Product
              </>
            ) : (
              <>
                <PlusOutlined className="ptable-modal-icon" /> Add New Product
              </>
            )}
          </div>
        }
        okText={editingProduct ? "Update" : "Add"}
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleFormSubmit}
        confirmLoading={submitLoading}
        destroyOnClose
        width={1000}
        className={isDarkMode ? "ptable-dark-modal" : "ptable-light-modal"}
        okButtonProps={{ className: "ptable-modal-ok-btn" }}
        cancelButtonProps={{ className: "ptable-modal-cancel-btn" }}
      >
        <Form form={form} layout="vertical" className="ptable-form">
          <div className="ptable-form-row">
            <Form.Item
              name="name"
              label={
                <span className="ptable-form-label">
                  <TagsOutlined className="ptable-form-icon" /> Product Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter product name" },
                { min: 2, message: "Product name must be at least 2 characters" },
              ]}
              className="ptable-form-item"
            >
              <Input placeholder="Enter product name" className="ptable-form-input" />
            </Form.Item>

            <Form.Item
              name="price"
              label={
                <span className="ptable-form-label">
                  <DollarOutlined className="ptable-form-icon" /> Product Price
                </span>
              }
              rules={[
                { required: true, message: "Please enter product price" },
                {
                  validator: (_, value) => {
                    if (value && (isNaN(value) || Number.parseFloat(value) <= 0)) {
                      return Promise.reject(new Error("Price must be a positive number"))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
              className="ptable-form-item"
            >
              <Input
                type="number"
                placeholder="Enter price"
                className="ptable-form-input"
                prefix="₹"
                min="0"
                step="0.01"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={
              <span className="ptable-form-label">
                <FileTextOutlined className="ptable-form-icon" /> Description
              </span>
            }
            rules={[
              { required: true, message: "Please enter product description" },
              { min: 10, message: "Description must be at least 10 characters" },
            ]}
          >
            <TextArea rows={4} placeholder="Enter product description" className="ptable-form-textarea" />
          </Form.Item>

          <Form.Item
            label={
              <span className="ptable-form-label">
                <FileImageOutlined className="ptable-form-icon" /> Product Image
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              onPreview={handlePreview}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              className="ptable-image-upload"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
            >
              {fileList.length >= 1 ? null : (
                <div className="ptable-upload-btn">
                  <PlusOutlined />
                  <div className="ptable-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={
              <span className="ptable-form-label">
                <TagsOutlined className="ptable-form-icon" /> Product Specifications
              </span>
            }
          >
            <div className="ptable-spec-container">
              <div className="ptable-spec-header">
                <h6 className="ptable-spec-title">Product Specifications</h6>
                <Button
                  type="primary"
                  onClick={handleAddSpecRow}
                  icon={<PlusOutlined />}
                  className="ptable-add-spec-btn"
                >
                  Add Specification
                </Button>
              </div>

              <div className="ptable-spec-table">
                {specs.map((spec, idx) => (
                  <div className="ptable-spec-row" key={spec.key || idx}>
                    <div className="ptable-spec-number">{idx + 1}</div>
                    <Input
                      placeholder="Specification (e.g. Size, Weight)"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                      className="ptable-spec-input"
                    />
                    <Input
                      placeholder="Value (e.g. 10cm, 2kg)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className="ptable-spec-input"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="ptable-remove-spec-btn"
                    />
                  </div>
                ))}

                {specs.length === 0 && (
                  <div className="ptable-no-specs-message">
                    No specifications added yet. Click "Add Specification" to start adding product details.
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductTable
