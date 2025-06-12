import React from 'react';
import './MissionVision.css';
import { motion } from 'framer-motion';
import { FaRocket, FaEye, FaSeedling, FaWater, FaLeaf, FaSeedling as FaSprout } from 'react-icons/fa';
import languageText from "../utils/languageText";

function MissionVision() {
  const visionItems = [
    {
      icon: <FaSeedling />,
      text: "Promote sustainable farming through 100% natural growing media."
    },
    {
      icon: <FaWater />,
      text: "Improve soil structure and water retention in diverse agro climates."
    },
    {
      icon: <FaLeaf />,
      text: "Reduce chemical dependency by enhancing microbial activity and aeration."
    },
    {
      icon: <FaSprout />,
      text: "Support global organic and hydroponic cultivation systems for better yield."
    }
  ];

  return (
    <motion.div 
      className="mvx-wrapper container my-5"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mvx-box text-white">
        <div className="mvx-content">
          <div className="mvx-mission-section">
            <div className="mvx-section-header">
              <div className="mvx-section-icon">
                <FaRocket />
              </div>
              <h2 className="mvx-section-title">Our Mission</h2>
            </div>
            <div className="mvx-mission-text">
              <p>
                To provide high-quality, eco-friendly coir pith products to global
                markets, supporting sustainable agriculture and environmental
                conservation. We aim to enhance soil health and promote a
                greener future by delivering innovative, cost-effective solutions
                that meet the diverse needs of our customers, while fostering
                long-term relationships built on trust, excellence, and
                commitment to sustainability.
              </p>
            </div>
          </div>

          <div className="mvx-divider">
            <div className="mvx-divider-line"></div>
            <div className="mvx-divider-circle"></div>
            <div className="mvx-divider-line"></div>
          </div>

          <div className="mvx-vision-section">
            <div className="mvx-section-header">
              <div className="mvx-section-icon">
                <FaEye />
              </div>
              <h2 className="mvx-section-title">Our Vision</h2>
            </div>
            <div className="mvx-vision-text">
              <p>
                Growing global demand for sustainable agriculture, environmental
                safety, and organic cultivation methods are the key drivers shaping
                the future of farming worldwide. With coir pith as an eco-friendly
                solution, we aim to:
              </p>

              <ul className="mvx-vision-list">
                {visionItems.map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="mvx-vision-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="mvx-vision-item-icon">{item.icon}</span>
                    <span className="mvx-vision-item-text">{item.text}</span>
                  </motion.li>
                ))}
              </ul>

              <p className="mvx-vision-conclusion">
                So, our vision is to empower eco-conscious growers and exporters
                by delivering premium quality coir pith products that nurture the
                soil, conserve resources, and boost global green farming efforts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MissionVision;