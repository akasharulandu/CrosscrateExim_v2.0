import React from 'react';
import './About.css'; // Import the CSS styling
import languageText from "../utils/languageText";


function About( ) {

  return (
    <div className="about-section container my-5 p-5 text-white" >
     <strong><h2 className="text-center fw-bold">About Us</h2></strong> <br />
      <p>
        Our company was established by two agriculture graduates from
        Tamil Nadu Agricultural University (TNAU), Coimbatore, with a
        shared vision to bring innovation and value to the coconut
        industry. With strong academic grounding and hands-on
        agricultural experience, we focus on the efficient utilization of
        coconut byproducts through sustainable practices and advanced
        processing methods.
        <br /><br />
        We specialize in producing high-quality, value-added products
        from coconut coir, husk, and shell, transforming agricultural
        residues into eco-friendly solutions. Each stage of our
        manufacturing process is designed to maximize resource
        efficiency, meet industry standards, and provide effective
        alternatives for farming, horticulture, and related sectors.
        <br /><br />
        Our commitment to quality, sustainability, and continuous
        improvement allows us to serve both domestic and international
        markets. By bridging traditional agricultural knowledge with
        modern techniques, we contribute to a more productive and
        environmentally responsible agricultural landscape.
      </p>
    </div>
  );
}

export default About;
