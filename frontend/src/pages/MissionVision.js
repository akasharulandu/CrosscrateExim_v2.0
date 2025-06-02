import React from 'react';
import './MissionVision.css'; // Add this line to import the custom styles
import languageText from "../utils/languageText";


function MissionVision() {
  return (
    <div className="mission-vision-box container my-5 p-5 text-white">
     <strong><h2 className="text-center fw-bold">Mission & Vision</h2></strong> <br />

      <p><strong>Our Mission:</strong> To provide high-quality, eco-friendly coir pith products to global
      markets, supporting sustainable agriculture and environmental
      conservation. We aim to enhance soil health and promote a
      greener future by delivering innovative, cost-effective solutions
      that meet the diverse needs of our customers, while fostering
      long-term relationships built on trust, excellence, and
      commitment to sustainability.</p>

      <br />

      <p><strong>Our Vision:</strong> Growing global demand for sustainable agriculture, environmental
      safety, and organic cultivation methods are the key drivers shaping
      the future of farming worldwide. With coir pith as an eco-friendly
      solution, we aim to:</p>

      <ul>
        <li>Promote sustainable farming through 100% natural growing media.</li>
        <li>Improve soil structure and water retention in diverse agro climates.</li>
        <li>Reduce chemical dependency by enhancing microbial activity and aeration.</li>
        <li>Support global organic and hydroponic cultivation systems for better yield.</li>
      </ul>

      <p>So, our vision is to empower eco-conscious growers and exporters
      by delivering premium quality coir pith products that nurture the
      soil, conserve resources, and boost global green farming efforts.</p>
    </div>
  );
}

export default MissionVision;
