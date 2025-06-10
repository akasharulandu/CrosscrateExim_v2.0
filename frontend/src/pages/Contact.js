import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/messages', {
        ...formData,
        read: false // Ensure message is marked as unread for admin
      });
      
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Your message has been sent successfully!');
        setErrorMessage('');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      setErrorMessage('There was an error sending your message.');
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="contact-section-wrapper"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container contact-section mt-5 text-white">
        <div className="contact-header">
          <h2 className="contact-title">Contact Us</h2>
          <div className="contact-subtitle">Get in touch with our team</div>
        </div>
        
        <div className="row contact-content">
          <div className="col-md-6">
            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-info-text">
                  <h4>Email</h4>
                  <p>crosscrateexim@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FaPhone />
                </div>
                <div className="contact-info-text">
                  <h4>Phone</h4>
                  <p>+91 94955 22449</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="contact-info-text">
                  <h4>Address</h4>
                  <p>Crosscrate International Exim Private Limited, Al Ameen, Parimanam, Muttom-Allepey, Kerala, India- 690511</p>
                </div>
              </div>
            </div>
            
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5148.435980725405!2d76.4908948908284!3d9.25197081838238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b061fae542b15af%3A0xb53175a1db6f3980!2s7F2V%2B4F4%2C%20Muttom%2C%20Kerala%20690511!5e1!3m2!1sen!2sin!4v1748793399919!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
                className="contact-map"
              ></iframe>
            </div>
          </div>

          <div className="col-md-6">
            <div className="contact-form-container">
              <h3 className="form-title">Send Us a Message</h3>
              
              {successMessage && (
                <motion.div 
                  className="alert alert-success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {successMessage}
                </motion.div>
              )}
              {successMessage && (() => {
                setTimeout(() => {
                  if (typeof setSuccessMessage === "function") setSuccessMessage("");
                }, 900);
                return null;
              })()}
              
              {errorMessage && (
                <motion.div 
                  className="alert alert-danger"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errorMessage}
                </motion.div>
              )}
              { errorMessage && (() => {
                setTimeout(() => {
                  if (typeof setErrorMessage === "function") setErrorMessage("");
                }, 900);
                return null;
              })()}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    className="form-control"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <span>Send Message</span>
                      <FaPaperPlane className="submit-icon" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Contact;