import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp, FaEnvelope, FaFilePdf } from "react-icons/fa";
import "./Home.css";
import axios from "axios";
import About from "../pages/About";
import MissionVision from "../pages/MissionVision";
import OurValues from "../pages/OurValues";
import Contact from "../pages/Contact";
import ProductCard from "../components/ProductCard";
import languageText from "../utils/languageText";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Home({ isAdmin }) {
  const [products, setProducts] = useState([]);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [heroImage, setHeroImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const productDetailsRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    axios
      .get("/api/hero")
      .then((res) => setHeroImage(res.data?.imageUrl || null))
      .catch((err) => console.error("Failed to fetch hero image:", err));
  }, []);

  const fetchProducts = () => {
    axios
      .get("/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className =
      newTheme === "light" ? "bg-light text-dark" : "bg-dark text-white";
  };

  const openModal = (product) => {
    const index = products.findIndex((p) => p._id === product._id);
    setSelectedProduct(product);
    setCurrentIndex(index);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      const nextIndex = currentIndex + 1;
      setSelectedProduct(products[nextIndex]);
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setSelectedProduct(products[prevIndex]);
      setCurrentIndex(prevIndex);
    }
  };

  const handleDownloadPDF = async () => {
    if (!productDetailsRef.current || !selectedProduct) return;

    // Find the fancy-scrollbar div inside the productDetailsRef
    const container = productDetailsRef.current;
    const fancyScrollbar = container.querySelector('.fancy-scrollbar');

    // Save original styles
    const originalStyle = fancyScrollbar
      ? {
          maxHeight: fancyScrollbar.style.maxHeight,
          overflowY: fancyScrollbar.style.overflowY,
        }
      : null;

    // Remove height limit for full rendering
    if (fancyScrollbar) {
      fancyScrollbar.style.maxHeight = "unset";
      fancyScrollbar.style.overflowY = "visible";
    }

    // Hide all elements with pdf-hide class BEFORE creating the logo image
    const pdfHideElements = container.querySelectorAll('.pdf-hide');
    pdfHideElements.forEach(el => {
      el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    });

    // Wait a moment for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const logo = new Image();
    logo.src = "/logo.png"; // Ensure this path is correct (public folder)

    logo.onload = () => {
      // Force reflow and wait for DOM update
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            onclone: function(clonedDoc) {
              // Also hide elements in the cloned document
              const clonedHideElements = clonedDoc.querySelectorAll('.pdf-hide');
              clonedHideElements.forEach(el => {
                el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
              });
            }
          });

          // Restore original styles
          if (fancyScrollbar && originalStyle) {
            fancyScrollbar.style.maxHeight = originalStyle.maxHeight;
            fancyScrollbar.style.overflowY = originalStyle.overflowY;
          }

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          // Header
          pdf.setFillColor(240, 240, 240);
          pdf.rect(0, 0, pageWidth, 297, "F");
          pdf.addImage(logo, "PNG", 15, 15, 35, 35);
          pdf.setFontSize(22);
          pdf.setTextColor(0, 102, 102);
          pdf.text("Crosscrate International Exim", 55, 25);
          pdf.setFontSize(12);
          pdf.setTextColor(50, 50, 50);
          pdf.text("Email: contact@crosscrate.com", 55, 33);
          pdf.text("Phone: +91 98765 43210", 55, 39);
          pdf.text("Website: www.crosscrate.com", 55, 45);
          pdf.text("Address: Al Ameen, Parimanam, Muttom-Allepey, Kerala, India- 690511", 55, 51);
          pdf.setDrawColor(180);
          pdf.line(10, 55, pageWidth - 10, 55);
          
          // Add product title
          pdf.setFontSize(14);
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${productText.productDetails || "Product Details"}: ${selectedProduct?.name || ""}`, 15, 65);

          // Image
          const imgWidth = pageWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let imgY = 75;

          if (imgHeight > pageHeight - imgY - 10) {
            pdf.addPage();
            imgY = 10;
          }

          pdf.addImage(imgData, "PNG", 10, imgY, imgWidth, imgHeight);
          pdf.save(`${selectedProduct?.name || "product"}.pdf`);
        } finally {
          // Always restore the elements regardless of success or failure
          pdfHideElements.forEach(el => {
            el.style.cssText = '';
          });
        }
      }, 50);
    };
  };

  // Get translations
  const navbarText = languageText[language]?.navbar || {};
  const productText = languageText[language]?.products || {};
  const adminText = languageText[language]?.admin || {};
  const actionsText = languageText[language]?.actions || {};

  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  return (
    <div
      className={`home-container ${theme} ${themeClass}`}
      style={{
        background:
          theme === "light"
            ? "linear-gradient(135deg,rgb(227, 249, 247),rgb(253, 218, 237))"
            : "linear-gradient(135deg,rgb(32, 36, 35),rgb(25, 28, 27))",
        minHeight: "100vh",
        transition: "background 0.5s ease",
      }}
    >
      {showLogoutAlert && (
        <div
          className="alert alert-success alert-dismissible fade show position-fixed end-0 m-3 slide-in-alert"
          role="alert"
          style={{ zIndex: 9999, top: "70px" }}
        >
          Logout Successful!
        </div>
      )}

      <Navbar
        isAdmin={isAdmin}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowLogoutAlert={setShowLogoutAlert}
      />

      <div
        className="hero-section d-flex align-items-center justify-content-center"
        style={{
          height: "300px",
          backgroundImage: `url(${heroImage || ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center text-white bg-dark bg-opacity-50 p-3 rounded">
          <h1 style={{
            background: "linear-gradient(45deg,rgb(243, 238, 238),rgb(255, 255, 255))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            fontSize: "2.5rem",
            fontWeight: "bold"
          }}>
            {navbarText.welcome || "Welcome to Crosscrate International Exim"}
          </h1>
          <p style={{
            background: "linear-gradient(45deg,rgb(6, 223, 93),rgb(246, 234, 237))", 
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.2rem",
            fontWeight: "500"
          }}>
            {navbarText.tagline || "Your one-stop solution for all cocopeat products"}
          </p>
        </div>
      </div>

      <div className="container mt-5" id="products">
        <h2 className="text-center mb-4 fw-bold">
          {navbarText.navbar?.products}
        </h2>
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4 col-sm-6 mb-4" key={product._id}>
              <div className="product-card" onClick={() => openModal(product)}>
                <img
                  src={product.images?.[0] || product.imageUrl}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-body">
                  <div className="product-title text-center fw-bold">{product.name}</div>
                  <div className="product-description">{product.description}</div>
                  {/* <div className="product-price">₹{product.price}</div> */}
                  <div className="product-tags">
                    {product.tags?.map((tag, idx) => (
                      <span className="product-tag" key={idx}>{tag}</span>
                    ))}
                  </div>
                  <button className="view-details-btn">
                    {productText.viewDetails || "View Details"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-5" id="about">
        <About language={language} />
      </div>

      <div className="container mt-5" id="mission">
        <MissionVision language={language} />
      </div>

      <div className="container mt-5" id="values">
        <OurValues language={language} />
      </div>

      <div className="container mt-5" id="contact" style={{ paddingBottom: "3rem" }}>
        <Contact language={language} />
      </div>

      {/* Modal with Fancy PDF button */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size="xl"
        className="fade modal-fade"
        backdrop="static"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Modal.Header
            closeButton
            style={{
              backgroundImage: "linear-gradient(90deg, rgb(11 146 128), rgb(222 182 198)",
              color: "#ffffff",
              borderTopLeftRadius: "0.3rem",
              borderTopRightRadius: "0.3rem",
            }}
          >
            <Modal.Title className="w-100 text-center fw-bold">
              {selectedProduct?.name || productText.productDetails || "Product Details"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{
              background: "linear-gradient(135deg, #f0f0f0 0%, #dcdcdc 100%)",
            }}
          >
            <div className="row" ref={productDetailsRef}>
              <div className="col-md-6">
                {selectedProduct?.images?.length > 0 ? (
                  <Carousel fade>
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={imgUrl}
                          alt={`Slide ${idx}`}
                          className="d-block w-100"
                          style={{ maxHeight: "400px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  selectedProduct?.imageUrl && (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                  )
                )}
              </div>

              <div className="col-md-6">
                <div
                  className="p-3 bg-white shadow rounded fancy-scrollbar"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <p><strong>{productText.description || "Description"}:</strong></p>
                  <p>{selectedProduct?.description}</p>

                  <p><strong>{productText.price || "Price"}:</strong> ₹{selectedProduct?.price}</p>

                  {selectedProduct?.specs && selectedProduct.specs.length > 0 && (
                    <>
                      <div className="specs-container p-3 rounded mt-4" style={{
                        background: theme === "dark" ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${theme === "dark" ? '#444' : '#ddd'}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <h6 className="specs-title mb-3" style={{ 
                          color: theme === "dark" ? '#34495e' : '#34495e',
                          background: theme === "dark" ? '#34495e' : '#f0f0f0',
                          borderBottom: `2px solid ${theme === "dark" ? '#444' : '#eee'}`,
                          paddingBottom: '10px'
                        }}>
                          {productText.specifications || "Specifications"}
                        </h6>
                        <div className="specs-grid">
                          {selectedProduct.specs.map((spec, idx) => (
                            <div 
                              key={idx} 
                              className="spec-item p-2 rounded mb-2"
                              style={{
                                background: theme === "dark" ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
                                border: `1px solid ${theme === "dark" ? '#333' : '#eee'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                            >
                              <div className="spec-number" style={{
                                minWidth: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: theme === "dark" ? '#1f1f1f' : '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: theme === "dark" ? '#fff' : '#666'
                              }}>
                                {idx + 1}
                              </div>
                              <div className="spec-content" style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <span className="spec-label" style={{
                                  fontWeight: '500',
                                  color: theme === "dark" ? '#ccc' : '#666'
                                }}>
                                  {spec.label}
                                </span>
                                <span className="spec-value" style={{
                                  color: theme === "dark" ? '#fff' : '#333',
                                  background: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  padding: '4px 12px',
                                  borderRadius: '4px',
                                  fontSize: '0.9rem'
                                }}>
                                  {spec.value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <hr />
                  <div className="d-flex justify-content-start gap-3 mt-3 pdf-hide">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${productText.share || "Check out this product"}: ${selectedProduct?.name}\n${navbarText.welcome || "Welcome to Crosscrate International Exim"}!\n` +
                        `https://www.crosscrate.com/product/${selectedProduct?._id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success fs-5"
                      title={productText.share || "Share Product"}
                    >
                      <FaWhatsapp />
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(productText.share || "Check out this product")}: ${selectedProduct?.name}&body=${selectedProduct?.description}`}
                      className="text-primary fs-5"
                      title={productText.byEmail || "Share by Email"}
                    >
                      <FaEnvelope />
                    </a>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownloadPDF();
                      }}
                      className="text-danger fs-5"
                      title={productText.downloadPdf || "Download PDF"}
                    >
                      <FaFilePdf />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
              {actionsText.back}
            </Button>
            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentIndex === products.length - 1}
            >
              {actionsText.next || "Next"}
            </Button>
            <Button variant="danger" onClick={handleClose}>
              {actionsText.close || "Close"}
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Home;
