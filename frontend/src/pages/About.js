import React, { useEffect } from 'react';
import './About.css';
import bgAbout from '../assets/bg-about.jpeg';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLeaf, FaGlobeAmericas } from 'react-icons/fa';
import languageText from "../utils/languageText";

function About() {
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-image', `url(${bgAbout})`);
  }, []);

  return (
    <div className="aboutx-section-wrapper">
      <motion.div 
        className="aboutx-section container my-5 p-0 text-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="aboutx-content-wrapper">
          <div className="aboutx-header">
            <div className="aboutx-header-line"></div>
            <h2 className="aboutx-title">About Us</h2>
            <div className="aboutx-header-line"></div>
          </div>
          
          <div className="aboutx-content">
            <div className="aboutx-card">
              <div className="aboutx-card-icon">
                <FaGraduationCap />
              </div>
              <div className="aboutx-card-text">
                <p>
                  Our company was established by two agriculture graduates from
                  Tamil Nadu Agricultural University (TNAU), Coimbatore, with a
                  shared vision to bring innovation and value to the coconut
                  industry. With strong academic grounding and hands-on
                  agricultural experience, we focus on the efficient utilization of
                  coconut byproducts through sustainable practices and advanced
                  processing methods.
                </p>
              </div>
            </div>
            
            <div className="aboutx-card">
              <div className="aboutx-card-icon">
                <FaLeaf />
              </div>
              <div className="aboutx-card-text">
                <p>
                  We specialize in producing high-quality, value-added products
                  from coconut coir, husk, and shell, transforming agricultural
                  residues into eco-friendly solutions. Each stage of our
                  manufacturing process is designed to maximize resource
                  efficiency, meet industry standards, and provide effective
                  alternatives for farming, horticulture, and related sectors.
                </p>
              </div>
            </div>
            
            <div className="aboutx-card">
              <div className="aboutx-card-icon">
                <FaGlobeAmericas />
              </div>
              <div className="aboutx-card-text">
                <p>
                  Our commitment to quality, sustainability, and continuous
                  improvement allows us to serve both domestic and international
                  markets. By bridging traditional agricultural knowledge with
                  modern techniques, we contribute to a more productive and
                  environmentally responsible agricultural landscape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default About;