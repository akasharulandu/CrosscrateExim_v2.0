import React from 'react';
import './OurValues.css';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaTrophy, 
  FaBalanceScale, 
  FaHandshake, 
  FaChartLine, 
  FaClipboardCheck 
} from 'react-icons/fa';
import languageText from "../utils/languageText";

function OurValues() {
  const values = [
    {
      title: "Customer orientation",
      description: "We build relationships that create a positive impact on the lives of our customers",
      icon: <FaUsers />
    },
    {
      title: "Excellence",
      description: "We deliver exceptional products and unmatched services that provide superior values to our customers",
      icon: <FaTrophy />
    },
    {
      title: "Integrity",
      description: "We maintain highest standards of integrity in everything we do",
      icon: <FaBalanceScale />
    },
    {
      title: "Collaboration",
      description: "We cooperate across borders, to fulfill our customers' needs and realize the company success",
      icon: <FaHandshake />
    },
    {
      title: "Drive for success",
      description: "We pursue a strong desire to succeed in every aspect of our business",
      icon: <FaChartLine />
    },
    {
      title: "Ownership",
      description: "We take personal responsibility for fulfilling our commitments",
      icon: <FaClipboardCheck />
    }
  ];

  return (
    <motion.div 
      className="our-values-section text-white py-5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container text-center">
        <div className="values-header">
          <h2 className="values-title">Our Values</h2>
          <p className="values-subtitle">
            The following represents who we are and what we stand for as a business
          </p>
        </div>
        
        <div className="values-grid">
          {values.map((value, index) => (
            <motion.div 
              key={index} 
              className="value-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
            >
              <div className="value-icon">
                {value.icon}
              </div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default OurValues;