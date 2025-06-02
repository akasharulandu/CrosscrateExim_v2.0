import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap';
import './ProductCard.css';
import languageText from "../utils/languageText";

const ProductCard = ({ product, onClick, language }) => {
  const texts = languageText[language] || {};
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="col-md-4 mb-3">
      <div 
  className="card h-100 hover-card shadow-sm" 
  onClick={() => onClick(product)} 
  style={{ cursor: 'pointer', border: '1px solid #dee2e6' }}
>

        {product.imageUrl && (
  <div style={{ borderBottom: '2px solid #ccc' }}>
    <img
      src={product.imageUrl}
      alt={product.name}
      className="card-img-top"
      style={{ height: '200px', objectFit: 'cover' }}
    />
  </div>
        )}
        <div className="card-body text-center">
          <h5 className="card-title">{product.name}</h5>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

