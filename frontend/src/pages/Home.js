import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWhatsapp,
  FaEnvelope,
  FaFilePdf,
  FaStar,
  FaEye,
  FaArrowRight,
  FaGlobe,
  FaLeaf,
  FaShieldAlt,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import "./Home.css";
import axios from "axios";
import About from "../pages/About";
import MissionVision from "../pages/MissionVision";
import OurValues from "../pages/OurValues";
import Contact from "../pages/Contact";
import languageText from "../utils/languageText";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const navigate = useNavigate();

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
    if (!selectedProduct) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Add logo
    const logoUrl = "/logo.png";
    const logoImg = new Image();
    logoImg.src = logoUrl;

    logoImg.onload = async () => {
      pdf.addImage(logoImg, "PNG", 15, 15, 30, 30);

      // Company Info
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

      // Product Title
      pdf.setFontSize(14);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Product Details: ${selectedProduct?.name || ""}`, 15, 65);

      // Product Image
      let imgY = 75;
      let imgHeight = 60;
      let imgWidth = 80;
      let textX = 15 + imgWidth + 10;
      let textY = imgY;

      // Download product image as base64
      const getBase64ImageFromUrl = async (imageUrl) => {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      };

      let imageUrl = selectedProduct.images?.[0] || selectedProduct.imageUrl;
      if (imageUrl) {
        const imgData = await getBase64ImageFromUrl(imageUrl);
        pdf.addImage(imgData, "JPEG", 15, imgY, imgWidth, imgHeight);
      }

      // Description
      pdf.setFontSize(12);
      pdf.setTextColor(0, 128, 64);
      pdf.text("Description", textX, textY + 5);
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      const descriptionLines = pdf.splitTextToSize(selectedProduct?.description || "", pageWidth - textX - 10);
      pdf.text(
        descriptionLines,
        textX,
        textY + 12
      );

      // Price (green, bold, left-aligned, just below description)
      const lineHeight = 4; // tighter line height
      const descriptionHeight = descriptionLines.length * lineHeight;
      const priceY = textY + 12 + descriptionHeight + 5; // minimal padding
      pdf.setFontSize(12);
      pdf.setTextColor(0, 180, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Price: ${selectedProduct?.price}`, textX, priceY);
      pdf.setFont("helvetica", "normal");

      // Specifications Table 
      if (selectedProduct?.specs?.length > 0) {
        autoTable(pdf, {
          startY: priceY + 10, // Start after price
          head: [["#", "Specification", "Value"]],
          body: selectedProduct.specs.map((spec, idx) => [
            idx + 1,
            spec.label,
            spec.value,
          ]),
          theme: "grid",
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 10 },
        });
      }

      pdf.save(`${selectedProduct?.name || "product"}.pdf`);
    };
  };

  // Get translations
  const navbarText = languageText[language]?.navbar || {};
  const productText = languageText[language]?.products || {};
  const adminText = languageText[language]?.admin || {};
  const actionsText = languageText[language]?.actions || {};

  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`crosscrate-home-container ${theme} ${themeClass}`}
      style={{
        background:
          theme === "light"
            ? "linear-gradient(135deg, #e3f9f7, #fddaed)"
            : "linear-gradient(135deg, #202423, #191c1b)",
        minHeight: "100vh",
        transition: "background 0.5s ease",
      }}
    >
      {showLogoutAlert && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="alert alert-success alert-dismissible fade show position-fixed end-0 m-3 crosscrate-home-slide-in-alert"
          role="alert"
          style={{ zIndex: 9999, top: "70px" }}
        >
          Logout Successful!
        </motion.div>
      )}

      <Navbar
        isAdmin={isAdmin}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowLogoutAlert={setShowLogoutAlert}
      />

      {/* Hero Section */}
      <section className="crosscrate-home-hero-section">
        <div className="crosscrate-home-hero-overlay"></div>
        
        {/* Animated Background Elements */}
        <div className="crosscrate-home-particles-container">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="crosscrate-home-particle"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="crosscrate-home-hero-content">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="crosscrate-home-hero-header"
          >
            <div className="crosscrate-home-premium-badge">
              <HiSparkles className="crosscrate-home-sparkle-icon" />
              <span>PREMIUM QUALITY</span>
              <HiSparkles className="crosscrate-home-sparkle-icon" />
            </div>

            <h1 className="crosscrate-home-company-name">
              <span className="crosscrate-home-gradient-text">Crosscrate</span>
              <br />
              <span className="crosscrate-home-white-text">International Exim</span>
            </h1>

            <p className="crosscrate-home-company-tagline">
              Your trusted partner for premium cocopeat products.
              <br />
              <span className="crosscrate-home-highlight-text">Sustainable • Natural • High Quality</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="crosscrate-home-hero-buttons"
          >
            <button
              className="crosscrate-home-primary-button"
              onClick={() => scrollToSection("products")}
            >
              Explore Products
              <FaArrowRight className="crosscrate-home-button-icon" />
            </button>
            <button
              className="crosscrate-home-secondary-button"
              onClick={() => scrollToSection("about")}
            >
              About Us
            </button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="crosscrate-home-feature-icons"
          >
            <div className="crosscrate-home-feature-item">
              <FaGlobe className="crosscrate-home-feature-icon crosscrate-home-global-icon" />
              <span>Global Export</span>
            </div>
            <div className="crosscrate-home-feature-item">
              <FaLeaf className="crosscrate-home-feature-icon crosscrate-home-natural-icon" />
              <span>100% Natural</span>
            </div>
            <div className="crosscrate-home-feature-item">
              <FaShieldAlt className="crosscrate-home-feature-icon crosscrate-home-quality-icon" />
              <span>Quality Assured</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="crosscrate-home-scroll-indicator"
        >
          <div className="crosscrate-home-scroll-mouse">
            <div className="crosscrate-home-scroll-wheel"></div>
          </div>
        </motion.div>
      </section>

      {/* Products Section */}
      <section className="crosscrate-home-products-section" id="products">
        <div className="crosscrate-home-container-inner">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="crosscrate-home-section-header"
          >
            <h2 className={`crosscrate-home-section-title ${theme === "dark" ? "text-white" : ""}`}>
              Our Premium Products
            </h2>
            <p className={`crosscrate-home-section-subtitle ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Discover our range of high-quality cocopeat products, carefully crafted for your gardening and
              agricultural needs.
            </p>
          </motion.div>

          <div className="crosscrate-home-products-grid">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="crosscrate-home-product-card-wrapper"
                onClick={() => openModal(product)}
              >
                <div className={`crosscrate-home-enhanced-product-card ${theme === "dark" ? "crosscrate-home-dark" : ""}`}>
                  {/* Product Image */}
                  <div className="crosscrate-home-product-image-container">
                    <img
                      src={product.images?.[0] || product.imageUrl}
                      alt={product.name}
                      className="crosscrate-home-product-image"
                    />
                    <div className="crosscrate-home-image-overlay"></div>
                    <div className="crosscrate-home-product-price-tag">₹{product.price}</div>
                    <div className="crosscrate-home-view-details-overlay">
                      <button className="crosscrate-home-view-details-button">
                        <FaEye className="crosscrate-home-view-icon" />
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="crosscrate-home-product-info">
                    <h3 className={`crosscrate-home-product-title ${theme === "dark" ? "text-white" : ""}`}>
                      {product.name}
                    </h3>
                    <p className={`crosscrate-home-product-description ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {product.description}
                    </p>

                    {/* Tags */}
                    <div className="crosscrate-home-product-tags">
                      {product.tags?.map((tag, idx) => (
                        <span key={idx} className="crosscrate-home-product-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="crosscrate-home-product-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="crosscrate-home-star-icon" />
                      ))}
                      <span className={`crosscrate-home-rating-count ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        (4.8)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <div className="crosscrate-home-other-sections">
        <div className="crosscrate-home-container-inner" id="about">
          <About language={language} />
        </div>
        <div className="crosscrate-home-container-inner" id="mission">
          <MissionVision language={language} />
        </div>
        <div className="crosscrate-home-container-inner" id="values">
          <OurValues language={language} />
        </div>
        <div className="crosscrate-home-container-inner" id="contact">
          <Contact language={language} />
        </div>
      </div>

      {/* Product Details Modal */}
      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        size="xl"
        className="crosscrate-home-product-modal fade crosscrate-home-modal-fade"
        backdrop="static"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Modal.Header
            closeButton
            className="crosscrate-home-enhanced-modal-header"
          >
            <Modal.Title className="w-100 text-center fw-bold">
              {selectedProduct?.name || productText.productDetails || "Product Details"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="crosscrate-home-enhanced-modal-body">
            <div className="row" ref={productDetailsRef}>
              <div className="col-md-6">
                {selectedProduct?.images?.length > 0 ? (
                  <Carousel fade className="crosscrate-home-enhanced-carousel">
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={imgUrl || "/placeholder.svg"}
                          alt={`Slide ${idx}`}
                          className="crosscrate-home-carousel-image"
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  selectedProduct?.imageUrl && (
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="crosscrate-home-single-product-image"
                    />
                  )
                )}
              </div>

              <div className="col-md-6">
                <div className="crosscrate-home-product-details crosscrate-home-fancy-scrollbar">
                  <div className="crosscrate-home-product-description-section">
                    <h4 className="crosscrate-home-detail-section-title">Description</h4>
                    <p className="crosscrate-home-detail-text">{selectedProduct?.description}</p>
                  </div>

                  <div className="crosscrate-home-product-price-section">
                    <span className="crosscrate-home-product-price">₹{selectedProduct?.price}</span>
                  </div>

                  {selectedProduct?.specs && selectedProduct.specs.length > 0 && (
                    <div className="crosscrate-home-product-specs-section">
                      <h5 className="crosscrate-home-specs-title">Specifications</h5>
                      <div className="crosscrate-home-specs-list">
                        {selectedProduct.specs.map((spec, idx) => (
                          <div key={idx} className="crosscrate-home-spec-item">
                            <span className="crosscrate-home-spec-label">{spec.label}</span>
                            <span className="crosscrate-home-spec-value">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  
                  <div className="crosscrate-home-product-actions pdf-hide">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${productText.share || "Check out this product"}: ${selectedProduct?.name}\n${navbarText.welcome || "Welcome to Crosscrate International Exim"}!\n` +
                        `https://www.crosscrate.com/product/${selectedProduct?._id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crosscrate-home-action-button crosscrate-home-whatsapp-button"
                      title={productText.share || "Share Product"}
                    >
                      <FaWhatsapp className="crosscrate-home-action-icon" />
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(productText.share || "Check out this product")}: ${selectedProduct?.name}&body=${selectedProduct?.description}`}
                      className="crosscrate-home-action-button crosscrate-home-email-button"
                      title={productText.byEmail || "Share by Email"}
                    >
                      <FaEnvelope className="crosscrate-home-action-icon" />
                      Email
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownloadPDF();
                      }}
                      className="crosscrate-home-action-button crosscrate-home-pdf-button"
                      title={productText.downloadPdf || "Download PDF"}
                    >
                      <FaFilePdf className="crosscrate-home-action-icon" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>


          <Modal.Footer className="crosscrate-home-enhanced-modal-footer">
            <Button
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="crosscrate-home-navigation-button prev-button"
            >
              ← {actionsText.back || "Previous"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleNext}
              disabled={currentIndex === products.length - 1}
              className="crosscrate-home-navigation-button next-button"
            >
              {actionsText.next || "Next"} →
            </Button>
            <Button 
              variant="danger" 
              onClick={handleClose}
              className="crosscrate-home-close-button"
            >
              {actionsText.close || "Close"}
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Home;