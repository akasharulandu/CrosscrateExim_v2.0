import React from 'react';
import './OurValues.css'; // We'll define this CSS next
import languageText from "../utils/languageText";


function OurValues() {
  return (
    <div className="our-values-section text-white py-5">
      <div className="container text-center">
        <h2 className="fw-bold mb-3">Our Values</h2>
        <p className="subheading">
          The following represents who we are and what we stand for as a business
        </p>
        <div className="row mt-4">
          <div className="col-md-4 mb-4">
            <strong><h5 className="fw-bold">Customer orientation</h5></strong>
            <p>We build relationships that create a positive impact on the lives of our customers</p>
          </div>
          <div className="col-md-4 mb-4">
            <strong><h5 className="fw-bold">Excellence</h5></strong>
            <p>We deliver exceptional products and unmatched services that provide superior values to our customers</p>
          </div>
          <div className="col-md-4 mb-4">
            <strong><h5 className="fw-bold">Integrity</h5></strong>
            <p>We maintain highest standards of integrity in everything we do</p>
          </div>
          <div className="col-md-4 mb-4">
            <strong><h5 className="fw-bold">Collaboration</h5></strong>
            <p>We cooperate across borders, to fulfill our customers’ needs and realize the company success</p>
          </div>
          <div className="col-md-4 mb-4">
            <strong><h5 className="fw-bold">Drive for success</h5></strong>
            <p>We pursue a strong desire to succeed in every aspect of our business</p>
          </div>
          <div className="col-md-4 mb-4">
           <strong> <h5 className="fw-bold">Ownership</h5></strong>
            <p>We take personal responsibility for fulfilling our commitments</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OurValues;
