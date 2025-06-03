import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap';
import './ProductCard.css';
import languageText from "../utils/languageText";

const ProductCard = ({ product, onClick, language }) => {
  const texts = languageText[language] || {};
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="crosscrate-product-col col-md-4 mb-3">
      <div 
        className="crosscrate-product-card hover-card shadow-sm" 
        onClick={() => onClick(product)}
      >
        {product.imageUrl && (
          <div className="crosscrate-product-image-container">
            <img
              src={product.imageUrl}
              alt={product.name?.en || product.name}
              className="crosscrate-product-image"
            />
          </div>
        )}
        <div className="crosscrate-product-body">
          <h5 className="crosscrate-product-title">
            {product.name?.en || product.name}
          </h5>
          <div className="crosscrate-product-price">
            ₹{product.price}
          </div>
          <div className="crosscrate-product-description">
            {product.description?.en || product.description}
          </div>
          <button className="crosscrate-product-view-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

